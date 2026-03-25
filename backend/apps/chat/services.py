from execution.models import Execution, ExecutionResult
from jobs.models import JobFile

def build_execution_context(execution):
    """Context built from a specific execution (results are the primary KB)"""
    results = ExecutionResult.objects.filter(execution=execution)
    
    context_str = f"CONTEXT: Analysis for Workflow '{execution.job.name}' (Report ID: {execution.id})\n"
    context_str += f"Date: {execution.started_at.strftime('%Y-%m-%d')}\n\n"
    
    context_str += "--- VERIFIED KNOWLEDGE BASE (EXECUTION RESULTS) ---\n"
    if not results.exists():
        context_str += "NO DATA FOUND for this execution fragment.\n"
    else:
        for r in results:
            context_str += f"Fragment: {r.job_file.file_name if r.job_file else 'Audit Source'}\n"
            # We focus on the RESPONSE as the knowledge base, as requested.
            context_str += f"Research Finding: {r.response}\n\n"
            
    return context_str

def build_job_context(job):
    """Context built from the overall workflow - DEFAULTS to the latest successful execution results."""
    # Find the latest successful execution to use as the KB
    latest_ex = Execution.objects.filter(job=job, status="SUCCESS").order_by('-started_at').first()
    
    if latest_ex:
        return build_execution_context(latest_ex)
    
    # Fallback if no execution results exist yet
    context_str = f"CONTEXT: Workflow '{job.name}' (Waiting for initial Telemetry)\n\n"
    context_str += "No results have been captured for this workflow yet. "
    context_str += "Please trigger the analysis execution so I have a knowledge base to work from."
    
    return context_str
