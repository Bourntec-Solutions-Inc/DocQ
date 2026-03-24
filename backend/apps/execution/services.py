from .models import Execution, ExecutionResult, ExecutionLog
from apps.jobs.models import JobFile
from django.utils import timezone
import concurrent.futures
import requests
import json


def invoke_bournai(prompt_text, execution=None):
    """
    Standardized API connector for the BRN-LLAMA infrastructure.
    Matches the exact JSON schema required by the production environment.
    """
    if execution:
        ExecutionLog.objects.create(
            execution=execution,
            message=f"Dispatching API request (Payload: {len(prompt_text)} chars)...",
            level="INFO"
        )
    
    # Exact payload structure requested by the user
    payload = {
        "model": "BournAI",
        "prompt": prompt_text,
        "stream": False,
        "agent_id": "uhli23jn3oiuhgo847yyjvdhtrdy3tgfe8gfgoe87rugekuuyjommjferhjgo5go49uoi3uyrp938ry",
        "platform_id": "DSuite"
    }
    
    try:
        # Hitting the validated Brn-Llama endpoint
        res = requests.post(
            "https://brn-llama.bourntec.com/api/process", 
            json=payload, 
            timeout=120, # High-detail reports require substantial inference time
            verify=True
        )
        
        if res.status_code == 200:
            data = res.json()
            
            # Universal extraction logic for Llama/BournAI responses
            response_text = data.get("response") or data.get("text") or data.get("content")
            
            # Recursively handle nested content structures if present
            if isinstance(response_text, list) and len(response_text) > 0:
                item = response_text[0]
                if isinstance(item, dict):
                    response_text = item.get("text") or item.get("content")

            if not response_text:
                response_text = str(data)

            if execution:
                ExecutionLog.objects.create(
                    execution=execution,
                    message="Intelligence engine responded successfully (200 OK).",
                    level="SUCCESS"
                )
            return response_text
        else:
            # Capturing the 'More data are required' or other 4XX errors correctly
            error_json = res.text
            try:
                error_json = json.dumps(res.json())
            except:
                pass
            raise Exception(f"Status {res.status_code}: {error_json}")

    except Exception as e:
        if execution:
            ExecutionLog.objects.create(
                execution=execution,
                message=f"Transmission error: {str(e)}",
                level="ERROR"
            )
        return (
            "Service Unavailable: The inference protocol mismatch or endpoint instability. "
            "Please verify that agent_id and platform_id are active in the central registry."
        )


def process_file(file, execution):
    try:
        ExecutionLog.objects.create(
            execution=execution,
            message=f"Ingesting source data: {file.file_name}",
            level="INFO"
        )
        
        with open(file.file.path, "r", encoding="utf-8") as f:
            prompt = f.read().strip()
            
        response = invoke_bournai(prompt, execution=execution)
        
        ExecutionResult.objects.create(
            execution=execution,
            job_file=file,
            prompt=prompt,
            response=response
        )
        
        ExecutionLog.objects.create(
            execution=execution,
            message=f"Audit complete for {file.file_name}.",
            level="SUCCESS"
        )
        
    except Exception as e:
        ExecutionLog.objects.create(
            execution=execution,
            message=f"Process termination: {str(e)}",
            level="ERROR"
        )

def execute_job(job, model_name="BournAI", trigger_type="MANUAL"):
    execution = Execution.objects.create(
        job=job,
        model_used=model_name or "BournAI",
        trigger_type=trigger_type or "MANUAL",
        status="RUNNING",
        started_at=timezone.now()
    )

    ExecutionLog.objects.create(
        execution=execution,
        message=f"Audit Center Initializing. Workflow: '{job.name}'.",
        level="INFO"
    )

    try:
        job_files = JobFile.objects.filter(job=job)
        
        if not job_files.exists():
            ExecutionLog.objects.create(
                execution=execution,
                message="Workflow blocked: Zero source files detected.",
                level="ERROR"
            )
            execution.status = "BLOCKED"
        else:
            with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
                futures = [executor.submit(process_file, file, execution) for file in job_files]
                concurrent.futures.wait(futures)
            
            execution.status = "SUCCESS"
            ExecutionLog.objects.create(
                execution=execution,
                message="Workflow execution finalized. Report buffers ready.",
                level="SUCCESS"
            )

    except Exception as e:
        execution.status = "FAILED"
        ExecutionLog.objects.create(
            execution=execution,
            message=f"Critical system failure: {str(e)}",
            level="ERROR"
        )

    execution.completed_at = timezone.now()
    execution.save()

    # System Report Generation
    try:
        from .pdf_service import generate_execution_pdf
        from django.core.files import File
        file_path = generate_execution_pdf(execution, report_type="detailed")
        with open(file_path, "rb") as f:
            execution.report_file.save(f"execution_{execution.id}.pdf", File(f))
    except:
        pass

    execution.save()
    return execution
