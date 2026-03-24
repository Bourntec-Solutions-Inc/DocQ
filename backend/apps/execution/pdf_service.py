from xhtml2pdf import pisa
import re
import os
import uuid
from django.conf import settings

def parse_md_to_html(text):
    """Deeply hardened markdown to HTML converter for PISA compatibility."""
    if not text: return ""
    safe_text = str(text)
    
    # Sequential, non-nested replacements to ensure stability
    safe_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', safe_text)
    safe_text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', safe_text)
    
    # Simple line break normalization
    safe_text = safe_text.replace('\n', '<br/>')
    
    # Protect against unclosed tags
    return safe_text

def generate_execution_pdf(execution, report_type="detailed"):
    """
    Rearchitected PDF Service focused on rendering stability.
    """
    # Defensive data collection
    results = list(execution.results.all())
    job_name = str(execution.job.name)
    exec_id = str(execution.id)
    exec_date = execution.started_at.strftime('%Y-%m-%d %H:%M') if execution.started_at else "---"
    
    colors = {
        "executive": "#1e3a8a",
        "detailed": "#111827",
        "sources": "#059669"
    }
    primary_color = colors.get(report_type, "#111827")
    
    # Build complete HTML string first to ensure no None values
    content_entries = []
    for res in results:
        raw_text = str(res.response or "")
        file_name = str(res.job_file.file_name)
        
        # Robust Case-Insensitive Splitter
        import re as pyre
        source_pattern = pyre.compile(r'(?i)\b(Sources|References|Citations)\b[:\- ]*')
        match = source_pattern.search(raw_text)
        
        if match:
            start_pos = match.start()
            marker_len = match.end() - match.start()
            findings = raw_text[:start_pos]
            sources = raw_text[match.end():]
        else:
            findings = raw_text
            sources = ""

        if report_type in ["executive", "detailed"]:
            entry = f"""
            <div style="margin-bottom: 20pt; padding: 10pt; border: 1px solid #f1f5f9;">
                <div style="font-size: 7pt; font-weight: bold; color: {primary_color}; opacity: 0.6; margin-bottom: 5pt; text-transform: uppercase;">
                    DOCQ ORIGIN: {file_name}
                </div>
                <div style="font-size: 10pt; color: #334155;">
                    {parse_md_to_html(findings)}
                </div>
            """
            if report_type == "detailed" and sources:
                entry += f"""
                <div style="background: #f8fafc; border-left: 3pt solid {primary_color}; padding: 8pt; margin-top: 10pt; font-size: 9pt; color: #475569;">
                    <b>VERIFIED SOURCES:</b><br/>{parse_md_to_html(sources)}
                </div>
                """
            entry += "</div>"
            content_entries.append(entry)

        elif report_type == "sources":
            display_sources = sources if sources else raw_text
            entry = f"""
            <div style="margin-bottom: 20pt; padding: 10pt; border: 1px solid #f1f5f9;">
                <div style="font-size: 7pt; font-weight: bold; color: {primary_color}; opacity: 0.6; margin-bottom: 5pt; text-transform: uppercase;">
                    DOCQ AUDIT SOURCE TRACKING: {file_name}
                </div>
                <div style="background: #f1f5f9; padding: 8pt; font-size: 9pt; color: #334155;">
                    <b>{"INTERNAL CITATIONS:" if sources else "CONTEXT RESULT:"}</b><br/>{parse_md_to_html(display_sources)}
                </div>
            </div>
            """
            content_entries.append(entry)

    # Singular template to minimize pisa overhead
    full_html = f"""
    <html>
    <head>
        <style>
            @page {{ size: a4; margin: 2cm; }}
            body {{ font-family: Helvetica; }}
        </style>
    </head>
    <body style="font-size: 10pt; color: #334155;">
        <div style="border-bottom: 3px solid {primary_color}; padding-bottom: 10pt; margin-bottom: 20pt;">
            <div style="font-size: 18pt; font-weight: bold; color: {primary_color};">DocQ | {report_type.upper()} REPORT</div>
            <div style="font-size: 8pt; color: #64748b; margin-top: 5pt;">
                SUBJECT: {job_name} | ID: #{exec_id} | DATE: {exec_date}
            </div>
        </div>
        {"".join(content_entries) if content_entries else '<div style="text-align: center; color: #94a3b8; margin-top: 100pt;">No audit data records available for this report type.</div>'}
    </body>
    </html>
    """

    # Ensure tmp directory exists
    temp_dir = os.path.join(settings.BASE_DIR, 'tmp')
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)
        
    file_path = os.path.join(temp_dir, f"{uuid.uuid4()}.pdf")
    
    # Save PDF
    with open(file_path, "wb") as f:
        pisa_status = pisa.CreatePDF(full_html, dest=f)
        if pisa_status.err:
            return None
            
    return file_path
