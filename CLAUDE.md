# CLAUDE.md — naaiprem.foto

เว็บไซต์ Portfolio / Landing Page หน้าเดียวของช่างภาพอิสระ **naaiprem.foto**
เป้าหมายเดียวของเว็บ: ให้คนดูผลงานแล้วประทับใจ → ติดต่อจองคิว

## ภาพรวมธุรกิจ
- รับถ่าย 4 ประเภท: งานแต่ง (พิธีเช้า / งานเลี้ยง / พรีเวดดิ้ง), รับปริญญา, พอร์ตนักเรียน (ยื่นมหาลัย / โปรไฟล์), อีเวนต์ (สัมมนา / ปาร์ตี้ / งานบริษัท / วันเกิด)
- รับงานทั่วประเทศไทย
- จุดขาย: **บรีฟท่าโพสให้ตลอด** (ไม่เคยถ่ายก็ไม่ต้องกังวล) และ **ไม่จำกัดจำนวนรูป**
- สไตล์ภาพ: โทนใส สดใส เน้นภาพแคนดิด เป็นธรรมชาติ
- ช่องทางหลัก: แชทเพจ Facebook "NAAI PREM" และโทร 062-234-9685 (`tel:0622349685`)
- ช่องทางรอง: Instagram `naaiprem_photo`, Facebook ส่วนตัว "เปรม ม."
- กลุ่มเป้าหมาย: คู่บ่าวสาว, บัณฑิตและครอบครัว, นักเรียน ม.ปลายและผู้ปกครอง, องค์กร/ผู้จัดงาน

## ข้อกำหนดเด็ดขาด
- HTML + CSS + JavaScript ล้วน แยกไฟล์ **ห้ามใช้ Framework / Library ภายนอก** (ยกเว้น Google Fonts) ไม่มี build step ไม่มีฐานข้อมูล
- ข้อความบนเว็บเป็น **ภาษาไทยทั้งหมด** น้ำเสียงเป็นกันเองแต่มืออาชีพ **ห้ามใช้ Lorem Ipsum**
- แสดงเฉพาะ **ราคาเริ่มต้น** บนการ์ดบริการ (งานแต่ง 5,500 / รับปริญญา 3,500 / พอร์ตนักเรียน 500 บาท — อีเวนต์ยังไม่มีราคา) ไม่ทำตารางแพ็กเกจ ปุ่มยังเป็น "สอบถามคิวและราคา" ให้ทักแชท
- ทุกภาพต้องมี `alt` ภาษาไทย และใช้ `loading="lazy"` (ยกเว้นภาพ Hero แรก)
- Animation ต้องนุ่มนวลและรองรับ `prefers-reduced-motion` เสมอ

## โครงสร้างไฟล์
```
index.html        โครงทุก section (ข้อความไทย, meta/OG, Google Fonts)
css/style.css     design tokens (:root) → base → components → sections → responsive → reduced-motion
js/data.js        ★ ข้อมูลที่แก้บ่อย: CONTACT, SETTINGS, STATS, GALLERY, REVIEWS
js/main.js        logic ทั้งหมด (nav, hero, gallery แยกหมวด+masonry, lightbox, slider, faq, cursor, counter, parallax, fab)
images/hero/        ภาพสไลด์ Hero (ต่อประเภทงาน: แนวนอนสำหรับคอม + *-portrait.jpg สำหรับมือถือ)
images/wedding/ graduation/ portfolio/ event/   ภาพแกลเลอรีแยกตามหมวด
images/services/    ภาพการ์ดบริการ
images/cta/         ภาพพื้นหลัง Call to Action
```
`data.js` ต้องโหลดก่อน `main.js` (ทั้งสองไฟล์ใช้ `defer`)

## จุดที่ต้องแก้บ่อย (ทั้งหมดอยู่ใน `js/data.js`)
- **CONTACT** — URL โซเชียลและเบอร์โทร ทุกลิงก์ในเว็บใช้แอตทริบิวต์ `data-contact="<key>"` แล้ว main.js จะเติม `href` ให้ แก้ที่ไฟล์นี้ที่เดียวก็เปลี่ยนทั้งเว็บ (ใน HTML ยังมี href สำรองไว้เผื่อ JS ไม่ทำงาน)
- **SETTINGS** — `grayscaleHover` (เปิด/ปิดเอฟเฟกต์ขาวดำ→สี), `initialCount`, `loadMoreCount`, `heroInterval`
- **STATS** — ตัวเลขในตัวนับ
- **GALLERY** — แกลเลอรีแยกเป็นหมวดตามบล็อก `.gallery__group` ใน `index.html` (ลำดับปัจจุบัน: รับปริญญา → งานแต่ง → พอร์ตนักเรียน) หมวดที่ไม่มีภาพจะถูกซ่อนเอง เพิ่มภาพได้โดยไม่ต้องแก้ HTML:
  1. วางไฟล์ไว้ใน `images/<หมวด>/` ตั้งชื่อเป็น `<หมวด>-NN.jpg` (ถ้าเป็นภาพแนวตั้งให้ต่อท้าย `-portrait`)
  2. เพิ่ม object `{ src, category, title, alt, width, height }` ลงใน array
  3. `width`/`height` ต้องเป็นขนาดจริงของไฟล์ เพราะ masonry ใช้สองค่านี้คำนวณความสูงก่อนภาพโหลด
  4. `category` ต้องเป็นหนึ่งใน `wedding | graduation | portfolio | event`
  5. ลำดับใน array = ลำดับในหมวดนั้น (8 ภาพแรกคือภาพที่คนเห็นก่อน)
  6. **ห้ามครอปภาพแนวนอนเป็นแนวตั้ง** แกลเลอรีแสดงตามสัดส่วนจริงเสมอ
- **Hero** — Hero เต็มจอใช้ `object-fit: cover` จึงต้องมีภาพแนวตั้ง (`<source media="(orientation: portrait)">`) ให้มือถือ ไม่งั้นภาพแนวนอนจะถูกตัดเหลือแนวตั้ง
- **REVIEWS** — ต้องมีรีวิวครบทั้ง 4 ประเภทงาน
- ข้อความ section อื่นๆ (บริการ, FAQ, ขั้นตอน, ระยะเวลาส่งงาน) อยู่ใน `index.html` โดยตรง และมีคอมเมนต์ `<!-- แก้: ... -->` กำกับไว้

## การเตรียมภาพ (ใช้ `sips` ที่มากับ macOS)
```bash
sips -g pixelWidth -g pixelHeight photo.jpg                    # ดูขนาดภาพ
sips -Z 1600 -s formatOptions 78 in.jpg --out out.jpg          # ย่อขอบยาวเหลือ 1600px แล้วบีบอัด
sips -c 1363 909 in.jpg --out portrait.jpg                     # ครอปกึ่งกลางเป็นแนวตั้ง (สูง กว้าง)
```
- ภาพแกลเลอรีใช้ขอบยาว 1600px ภาพ Hero/CTA ใช้ 2000px ขนาดไฟล์ควรอยู่ราว 200–400KB
- ภาพต้นฉบับอยู่ที่ `~/Desktop/python/input_photos/` และโฟลเดอร์ `รับปริญญา /` `งานเเต่ง/` `พอร์ตนักเรียน/` ที่ root ของโปรเจกต์ **ห้ามแก้หรือลบไฟล์ต้นฉบับ** ให้คัดลอกออกมาเท่านั้น
- ไฟล์ `.dng` (RAW) ไม่มีข้อมูลการหมุนภาพ ต้องตรวจและหมุนเองด้วย `sips -r 90`

## Design tokens
- พื้นหลัง `--bg #0a0a0a`, `--bg-alt #141414`, `--surface #1b1b1b` (สลับพื้นแต่ละ section เพื่อแบ่งจังหวะ)
- ข้อความ `--text #f2f2f2`, `--text-muted #a3a3a3`, `--text-dim #6b6b6b`
- Accent `--accent #ffffff` (ขาวล้วน) ใช้อย่างประหยัด ปุ่มหลักเป็นพื้นขาวตัวอักษรดำ ปุ่มรองเป็นขอบขาว
- ฟอนต์: Cormorant Garamond (ชื่อแบรนด์/ตัวเลข/eyebrow ภาษาอังกฤษ), Prompt (หัวข้อไทย), IBM Plex Sans Thai (เนื้อหา)
- Breakpoints: 480 / 768 / 1024 / 1200
- Easing `--ease: cubic-bezier(.22,1,.36,1)` ระยะเวลา 600–900ms

## Convention
- ตั้งชื่อคลาสแบบ BEM-lite (`.gallery__item`, `.btn--primary`, `.is-active`)
- Animation ใช้แค่ `transform` / `opacity` (ยกเว้น `filter` ของ grayscale)
- เพิ่ม element ที่ต้องการให้ค่อยๆ โผล่ตอน scroll ด้วยคลาส `.reveal` (ใช้ `data-delay` เพื่อทำ stagger)
- ลิงก์ติดต่อใช้ `data-contact` เสมอ **ห้าม hard-code URL ใหม่ใน main.js**
- เอฟเฟกต์ที่ใช้เมาส์ (cursor, hover grayscale) ต้องอยู่ใต้ `(hover: hover) and (pointer: fine)`

## วิธีพรีวิว
```bash
cd ~/Desktop/Webside_naaiprem && python3 -m http.server 8000
# แล้วเปิด http://localhost:8000
```

## TODO — ยังรอข้อมูลจริง
- [ ] URL Facebook Page / Messenger / Facebook ส่วนตัว ใน `CONTACT`
- [ ] รีวิวจริงใน `REVIEWS`
- [ ] ตัวเลขจริงใน `STATS`
- [ ] ระยะเวลาส่งงานของแต่ละบริการ (ใน `index.html` และคำตอบใน FAQ)
- [x] ภาพจริงของหมวดงานแต่ง / รับปริญญา / พอร์ตนักเรียน
- [ ] ภาพจริงของหมวดอีเวนต์ (แกลเลอรียังไม่มีหมวดอีเวนต์ / Hero สไลด์ 4 และการ์ดบริการอีเวนต์ยังใช้ภาพตัวอย่าง)
- [ ] ภาพ OG (`og:image`) และ URL โดเมนจริง
