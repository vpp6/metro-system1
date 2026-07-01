from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.lib.enums import TA_RIGHT, TA_CENTER, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os
from datetime import datetime


def generate_incident_report(incident_data: dict) -> bytes:
    import tempfile
    buf = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    doc = SimpleDocTemplate(
        buf.name,
        pagesize=A4,
        rightMargin=15*mm,
        leftMargin=15*mm,
        topMargin=15*mm,
        bottomMargin=15*mm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle', parent=styles['Title'],
        fontSize=18, spaceAfter=20,
        alignment=TA_CENTER,
    )
    heading_style = ParagraphStyle(
        'CustomHeading', parent=styles['Heading2'],
        fontSize=13, spaceAfter=8, spaceBefore=16,
        textColor=colors.HexColor("#1a237e"),
    )
    normal_style = ParagraphStyle(
        'CustomNormal', parent=styles['Normal'],
        fontSize=10, spaceAfter=4,
    )
    label_style = ParagraphStyle(
        'LabelStyle', parent=styles['Normal'],
        fontSize=10, textColor=colors.gray,
    )

    elements = []

    elements.append(Paragraph("تقرير الحادث", title_style))
    elements.append(Paragraph(f"نظام إدارة عمليات محطات المترو الذكي", ParagraphStyle(
        'SubTitle', parent=styles['Normal'], fontSize=11,
        alignment=TA_CENTER, textColor=colors.gray, spaceAfter=20
    )))

    inc = incident_data

    inc_info = [
        ["رقم الحادث", inc.get("incident_number", ""), "التاريخ", str(inc.get("date", ""))],
        ["الوقت", str(inc.get("time", "")), "الوردية", inc.get("shift", "")],
        ["المحطة", inc.get("station", ""), "الموقع", inc.get("location", "")],
    ]
    t = Table(inc_info, colWidths=[70, 120, 70, 120])
    t.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#e8eaf6")),
        ('BACKGROUND', (2, 0), (2, -1), colors.HexColor("#e8eaf6")),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 10))

    elements.append(Paragraph("وصف الحادث", heading_style))
    elements.append(Paragraph(inc.get("description", ""), normal_style))
    elements.append(Spacer(1, 6))

    # Detection
    det = inc.get("detection", {})
    if det:
        elements.append(Paragraph("معلومات الاكتشاف والإبلاغ", heading_style))
        det_info = [
            ["مكتشف الحادث", det.get("discovered_by", ""), "المبلغ", det.get("first_reporter", "")],
            ["وقت الاكتشاف", str(det.get("detection_time", "")), "وقت إبلاغ OCC", str(det.get("occ_notification_time", ""))],
            ["وقت استجابة OCC", str(det.get("occ_response_time", "")), "رمز الطوارئ", det.get("emergency_code", "")],
        ]
        t = Table(det_info, colWidths=[90, 100, 90, 100])
        t.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#e8f5e9")),
            ('BACKGROUND', (2, 0), (2, -1), colors.HexColor("#e8f5e9")),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 6))

    # Incident Types
    types = inc.get("incident_types", [])
    if types:
        elements.append(Paragraph("نوع الحادث", heading_style))
        type_list = [t["type_name"] for t in types]
        elements.append(Paragraph("، ".join(type_list), normal_style))
        elements.append(Spacer(1, 6))

    # Passengers
    passengers = inc.get("passengers", [])
    if passengers:
        elements.append(Paragraph("بيانات الركاب", heading_style))
        for p in passengers:
            p_data = [
                ["الاسم", p.get("name", ""), "العمر", str(p.get("age", ""))],
                ["الهاتف", p.get("phone", ""), "جهة الاتصال", p.get("emergency_contact", "")],
                ["الحالة", p.get("passenger_status", ""), "المستشفى", p.get("hospital_name", "")],
            ]
            t = Table(p_data, colWidths=[70, 120, 70, 120])
            t.setStyle(TableStyle([
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#fff3e0")),
                ('BACKGROUND', (2, 0), (2, -1), colors.HexColor("#fff3e0")),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('PADDING', (0, 0), (-1, -1), 5),
            ]))
            elements.append(t)
            elements.append(Spacer(1, 4))

    # Train Operations
    train = inc.get("train_operations", {})
    if train and train.get("train_number"):
        elements.append(Paragraph("عمليات القطار", heading_style))
        train_info = [
            ["رقم القطار", train.get("train_number", ""), "الوضع", train.get("operation_mode", "")],
            ["الموقع", train.get("current_location", ""), "الوجهة", train.get("destination", "")],
        ]
        if train.get("rescue_train_number"):
            train_info.append([
                "قطر الإنقاذ", train.get("rescue_train_number", ""), "", ""
            ])
        t = Table(train_info, colWidths=[90, 100, 70, 120])
        t.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#e3f2fd")),
            ('BACKGROUND', (2, 0), (2, -1), colors.HexColor("#e3f2fd")),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 6))

    # Evacuation
    evac = inc.get("evacuation", {})
    if evac and evac.get("evacuation_order_time"):
        elements.append(Paragraph("إخلاء المحطة", heading_style))
        evac_info = [
            ["وقت أمر الإخلاء", str(evac.get("evacuation_order_time", "")), "وقت البدء", str(evac.get("evacuation_start_time", ""))],
            ["وقت الاكتمال", str(evac.get("evacuation_completion_time", "")), "إبلاغ OCC", str(evac.get("station_clear_notification_time", ""))],
            ["إعادة الفتح", str(evac.get("station_reopening_time", "")), "", ""],
        ]
        t = Table(evac_info, colWidths=[90, 100, 90, 100])
        t.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#fce4ec")),
            ('BACKGROUND', (2, 0), (2, -1), colors.HexColor("#fce4ec")),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 6))

    # Impact Assessment
    impact = inc.get("impact", {})
    if impact:
        elements.append(Paragraph("تقييم الأثر", heading_style))
        impact_info = [
            ["مدة الحادث (دقائق)", str(impact.get("incident_duration", "")), "مدة الاستجابة", str(impact.get("response_duration", ""))],
            ["تأخير القطارات", str(impact.get("train_delays", "")), "الركاب المتأثرين", str(impact.get("passengers_affected", ""))],
            ["الإصابات", str(impact.get("injuries", "")), "الوفيات", str(impact.get("fatalities", ""))],
        ]
        t = Table(impact_info, colWidths=[90, 100, 90, 100])
        t.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#f3e5f5")),
            ('BACKGROUND', (2, 0), (2, -1), colors.HexColor("#f3e5f5")),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 6))

        if impact.get("cause"):
            elements.append(Paragraph("سبب الحادث", heading_style))
            elements.append(Paragraph(impact["cause"], normal_style))

        if impact.get("corrective_actions"):
            elements.append(Paragraph("الإجراءات التصحيحية", heading_style))
            elements.append(Paragraph(impact["corrective_actions"], normal_style))

        if impact.get("lessons_learned"):
            elements.append(Paragraph("الدروس المستفادة", heading_style))
            elements.append(Paragraph(impact["lessons_learned"], normal_style))

    # Footer
    elements.append(Spacer(1, 20))
    footer_style = ParagraphStyle(
        'Footer', parent=styles['Normal'],
        fontSize=8, textColor=colors.grey, alignment=TA_CENTER,
    )
    elements.append(Paragraph(
        f"تم إنشاء التقرير في {datetime.now().strftime('%Y-%m-%d %H:%M')} "
        f"| نظام إدارة عمليات محطات المترو الذكي",
        footer_style
    ))

    doc.build(elements)

    with open(buf.name, 'rb') as f:
        pdf_bytes = f.read()

    os.unlink(buf.name)
    return pdf_bytes
