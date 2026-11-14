import sys
from pptx import Presentation
p=Presentation(sys.argv[1])
for i,s in enumerate(p.slides,1):
    print(f"\n=== SLIDE {i} ===")
    def walk(shapes):
        for sh in shapes:
            if sh.shape_type==6: walk(sh.shapes)
            elif sh.has_text_frame:
                t=" | ".join(x.text.strip() for x in sh.text_frame.paragraphs if x.text.strip())
                if t: print(t)
            elif getattr(sh,'has_table',False) and sh.has_table:
                for r in sh.table.rows: print(" ; ".join(c.text for c in r.cells))
    walk(s.shapes)
    if s.has_notes_slide and s.notes_slide.notes_text_frame.text.strip(): print("NOTES:",s.notes_slide.notes_text_frame.text)
