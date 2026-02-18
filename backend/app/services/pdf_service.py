from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime
import os
from typing import Dict, List
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Use non-GUI backend
import io

class PDFReportService:
    
    @staticmethod
    def _create_pie_chart(categories: Dict) -> str:
        """Create category distribution pie chart"""
        if not categories:
            return None
        
        # Prepare data
        labels = [cat.capitalize() for cat in categories.keys()]
        sizes = [data['total'] for data in categories.values()]
        colors_list = ['#6366f1', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
        
        # Create figure
        fig, ax = plt.subplots(figsize=(6, 5))
        wedges, texts, autotexts = ax.pie(
            sizes, 
            labels=labels, 
            autopct='%1.1f%%',
            colors=colors_list[:len(labels)],
            startangle=90
        )
        
        # Style
        for text in texts:
            text.set_fontsize(10)
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontsize(9)
            autotext.set_weight('bold')
        
        ax.set_title('Spending by Category', fontsize=14, weight='bold')
        
        # Save to temp file
        temp_path = os.path.join("uploads", "temp_pie_chart.png")
        plt.tight_layout()
        plt.savefig(temp_path, dpi=150, bbox_inches='tight', facecolor='white')
        plt.close()
        
        return temp_path
    
    @staticmethod
    def _create_bar_chart(categories: Dict) -> str:
        """Create top categories bar chart"""
        if not categories:
            return None
        
        # Sort and get top 5
        sorted_cats = sorted(categories.items(), key=lambda x: x[1]['total'], reverse=True)[:5]
        
        labels = [cat[0].capitalize() for cat in sorted_cats]
        values = [cat[1]['total'] for cat in sorted_cats]
        
        # Create figure
        fig, ax = plt.subplots(figsize=(7, 4))
        bars = ax.bar(labels, values, color='#6366f1', alpha=0.8)
        
        # Add value labels on top of bars
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'${height:.2f}',
                   ha='center', va='bottom', fontsize=9, weight='bold')
        
        ax.set_xlabel('Category', fontsize=11, weight='bold')
        ax.set_ylabel('Amount Spent ($)', fontsize=11, weight='bold')
        ax.set_title('Top 5 Spending Categories', fontsize=14, weight='bold')
        ax.grid(axis='y', alpha=0.3)
        
        # Rotate labels if needed
        plt.xticks(rotation=45, ha='right')
        
        # Save to temp file
        temp_path = os.path.join("uploads", "temp_bar_chart.png")
        plt.tight_layout()
        plt.savefig(temp_path, dpi=150, bbox_inches='tight', facecolor='white')
        plt.close()
        
        return temp_path
    
    @staticmethod
    def _create_trend_chart(monthly_trend: List[Dict]) -> str:
        """Create spending trend line chart"""
        if not monthly_trend or len(monthly_trend) < 2:
            return None
        
        months = [item['month'] for item in monthly_trend]
        amounts = [item['amount'] for item in monthly_trend]
        
        # Create figure
        fig, ax = plt.subplots(figsize=(7, 4))
        ax.plot(months, amounts, marker='o', linewidth=2.5, 
               markersize=8, color='#6366f1', markerfacecolor='#ec4899')
        
        # Fill area under the line
        ax.fill_between(range(len(months)), amounts, alpha=0.3, color='#6366f1')
        
        ax.set_xlabel('Month', fontsize=11, weight='bold')
        ax.set_ylabel('Amount Spent ($)', fontsize=11, weight='bold')
        ax.set_title('Spending Trend', fontsize=14, weight='bold')
        ax.grid(True, alpha=0.3)
        
        # Rotate x-axis labels
        plt.xticks(rotation=45, ha='right')
        
        # Save to temp file
        temp_path = os.path.join("uploads", "temp_trend_chart.png")
        plt.tight_layout()
        plt.savefig(temp_path, dpi=150, bbox_inches='tight', facecolor='white')
        plt.close()
        
        return temp_path
    
    @staticmethod
    def generate_monthly_report(
        analytics: Dict,
        categories: Dict,
        budgets: List[Dict],
        insights: List[Dict],
        output_path: str
    ):
        """Generate a comprehensive monthly spending report with charts"""
        
        # Create the PDF document
        doc = SimpleDocTemplate(output_path, pagesize=letter)
        story = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#6366f1'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#6366f1'),
            spaceAfter=12,
            spaceBefore=20
        )
        
        # Title
        title = Paragraph("ShopSense AI<br/>Monthly Spending Report", title_style)
        story.append(title)
        
        # Date
        date_text = Paragraph(
            f"<para align=center>Generated on {datetime.now().strftime('%B %d, %Y')}</para>",
            styles['Normal']
        )
        story.append(date_text)
        story.append(Spacer(1, 0.3 * inch))
        
        # Summary Section
        story.append(Paragraph("Executive Summary", heading_style))
        
        summary_data = [
            ['Metric', 'Value'],
            ['Total Spent', f"${analytics.get('total_spent', 0):.2f}"],
            ['Total Transactions', str(analytics.get('transaction_count', 0))],
            ['Average Transaction', f"${analytics.get('average_transaction', 0):.2f}"],
            ['Top Category', analytics.get('top_category', 'N/A')],
            ['Top Store', analytics.get('top_store', 'N/A')]
        ]
        
        summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6366f1')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
        ]))
        
        story.append(summary_table)
        story.append(Spacer(1, 0.4 * inch))
        
        # === ADD CHARTS SECTION ===
        story.append(Paragraph("Visual Analytics", heading_style))
        
        # Pie Chart
        pie_chart_path = PDFReportService._create_pie_chart(categories)
        if pie_chart_path and os.path.exists(pie_chart_path):
            story.append(Image(pie_chart_path, width=5*inch, height=4*inch))
            story.append(Spacer(1, 0.2 * inch))
        
        # Bar Chart
        bar_chart_path = PDFReportService._create_bar_chart(categories)
        if bar_chart_path and os.path.exists(bar_chart_path):
            story.append(Image(bar_chart_path, width=5.5*inch, height=3.2*inch))
            story.append(Spacer(1, 0.2 * inch))
        
        # Trend Chart
        monthly_trend = analytics.get('monthly_trend', [])
        trend_chart_path = PDFReportService._create_trend_chart(monthly_trend)
        if trend_chart_path and os.path.exists(trend_chart_path):
            story.append(Image(trend_chart_path, width=5.5*inch, height=3.2*inch))
            story.append(Spacer(1, 0.3 * inch))
        
        # Page break before tables
        story.append(PageBreak())
        
        # Category Breakdown
        story.append(Paragraph("Detailed Category Breakdown", heading_style))
        
        if categories:
            category_data = [['Category', 'Amount', 'Percentage', '# Items']]
            for cat_name, cat_data in categories.items():
                category_data.append([
                    cat_name.capitalize(),
                    f"${cat_data.get('total', 0):.2f}",
                    f"{cat_data.get('percentage', 0):.1f}%",
                    str(cat_data.get('count', 0))
                ])
            
            category_table = Table(category_data, colWidths=[1.8*inch, 1.3*inch, 1.3*inch, 1.1*inch])
            category_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6366f1')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
            ]))
            
            story.append(category_table)
            story.append(Spacer(1, 0.3 * inch))
        
        # Budget Status
        if budgets:
            story.append(Paragraph("Budget Status", heading_style))
            
            budget_data = [['Category', 'Budget', 'Spent', 'Remaining', 'Status']]
            for budget in budgets:
                status = "✓ OK" if budget['percentage_used'] < 90 else "⚠ Warning" if budget['percentage_used'] < 100 else "✗ Over"
                budget_data.append([
                    budget['category'].capitalize(),
                    f"${budget['monthly_limit']:.2f}",
                    f"${budget['current_spent']:.2f}",
                    f"${budget['remaining']:.2f}",
                    status
                ])
            
            budget_table = Table(budget_data, colWidths=[1.3*inch, 1.2*inch, 1.2*inch, 1.2*inch, 1.1*inch])
            budget_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6366f1')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
            ]))
            
            story.append(budget_table)
            story.append(Spacer(1, 0.3 * inch))
        
        # AI Insights
        if insights:
            story.append(Paragraph("AI-Generated Insights & Recommendations", heading_style))
            
            for idx, insight in enumerate(insights[:5], 1):  # Show top 5
                insight_text = f"<b>{idx}. {insight.get('title', 'Insight')}</b><br/>{insight.get('description', '')}"
                story.append(Paragraph(insight_text, styles['Normal']))
                story.append(Spacer(1, 0.15 * inch))
        
        # Footer
        story.append(Spacer(1, 0.5 * inch))
        footer = Paragraph(
            "<para align=center><i>Generated by ShopSense AI - Track Smart, Spend Smarter<br/>Built by Francis Mutua</i></para>",
            styles['Normal']
        )
        story.append(footer)
        
        # Build PDF
        doc.build(story)
        
        # Cleanup temp chart files
        for temp_file in [pie_chart_path, bar_chart_path, trend_chart_path]:
            if temp_file and os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                except:
                    pass
        
        return output_path

pdf_service = PDFReportService()