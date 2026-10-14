/* =====================================================================
   naaiprem.foto — ไฟล์ข้อมูล (แก้ไฟล์นี้ไฟล์เดียวก็พอสำหรับงานประจำวัน)
   ---------------------------------------------------------------------
   • CONTACT  : เบอร์โทร / ลิงก์โซเชียล (ทุกปุ่มในเว็บดึงจากตรงนี้)
   • SETTINGS : เปิด-ปิดเอฟเฟกต์ และจำนวนภาพที่โหลดในแกลเลอรี
   • STATS    : ตัวเลขในตัวนับ
   • GALLERY  : รายการภาพผลงาน (เพิ่ม/ลบภาพแค่แก้ Array นี้)
   • COVER    : ภาพในหน้าปก (คอลัมน์ภาพเฉียง)
   • STRIP    : ภาพในแถบภาพวิ่ง
   • BOOKING  : ระบบจองคิวออนไลน์ (แพ็กเกจ เวลา บัญชีรับมัดจำ)
   • REVIEWS  : รีวิวจากลูกค้า
   ===================================================================== */

/* ---------- ข้อมูลติดต่อ ----------
   แก้ URL จริงตรงนี้ที่เดียว ปุ่ม/ลิงก์ทั้งเว็บที่มี data-contact="..." จะเปลี่ยนตามอัตโนมัติ */
const CONTACT = {
  phoneLabel: '062-234-9685',
  phone: 'tel:0622349685',
  facebookPage: 'https://www.facebook.com/people/NAAI-PREM/61560883106906/',
  // ปุ่ม "สอบถาม / ทักแชท" ทั้งเว็บ — ตอนนี้พาไปหน้าเพจ (ลูกค้ากดปุ่มข้อความบนเพจได้)
  messenger: 'https://www.facebook.com/people/NAAI-PREM/61560883106906/',
  // TODO: ใส่ URL Facebook ส่วนตัว "เปรม ม." จริง
  facebookPersonal: 'https://www.facebook.com/',
  instagram: 'https://www.instagram.com/naaiprem_photo/',
};

/* ---------- การตั้งค่า ---------- */
const SETTINGS = {
  grayscaleHover: false, // true = ภาพในแกลเลอรีเริ่มเป็นขาวดำเล็กน้อยแล้วเป็นสีเมื่อ hover | false = แสดงภาพสีตลอด
  initialCount: 12,     // จำนวนภาพที่แสดงครั้งแรก (ต่อหมวด)
  loadMoreCount: 12,    // จำนวนภาพที่เพิ่มเมื่อกด "ดูเพิ่มเติม" (ต่อหมวด)
  reviewInterval: 6500, // เวลาเลื่อนรีวิวอัตโนมัติ (มิลลิวินาที)
};

/* ---------- ตัวเลขในตัวนับ ----------
   suffix = ต่อท้ายตัวเลข (เช่น +) / unit = หน่วยภาษาไทยตัวเล็กหลังตัวเลข (เช่น ปี) */
const STATS = [
  { value: 5,   unit: 'ปี', label: 'ประสบการณ์ถ่ายภาพ' },
  { value: 100, suffix: '+', label: 'ลูกค้าไว้วางใจ' },
];

/* ---------- ชื่อหมวดหมู่ (ใช้กับปุ่ม Filter และป้ายบนภาพ) ---------- */
const CATEGORIES = {
  wedding: 'งานแต่ง',
  graduation: 'รับปริญญา',
  portfolio: 'พอร์ตนักเรียน',
  ordination: 'งานอุปสมบท',
  event: 'อีเวนต์', // ใช้กับรีวิวเดิม
};

/* ---------- แกลเลอรีผลงาน ----------
   หน้าเว็บแบ่งผลงานเป็นหมวด (รับปริญญา → งานแต่ง → พอร์ตนักเรียน)
   ลำดับของหมวดกำหนดใน index.html (ย้ายบล็อก .gallery__group ขึ้น-ลงได้)

   วิธีเพิ่มภาพ:
   1) วางไฟล์ไว้ที่ images/<หมวด>/ เช่น images/wedding/wedding-31.jpg (ภาพแนวตั้งต่อท้าย -portrait)
   2) เพิ่ม object ลงใน array ด้านล่าง
      - category : wedding | graduation | portfolio | event
      - title    : ชื่อภาพ (แสดงบนภาพ และใน Lightbox)
      - alt      : คำอธิบายภาพภาษาไทย (บรรยายสิ่งที่เห็นในภาพจริง)
      - width / height : ขนาดจริงของไฟล์ (ดูได้ด้วย: sips -g pixelWidth -g pixelHeight ไฟล์.jpg)
        ⚠️ ห้ามครอปภาพแนวนอนให้เป็นแนวตั้ง — แกลเลอรีแสดงภาพตามสัดส่วนจริงเสมอ
   3) ลำดับใน array = ลำดับที่แสดงในหมวดนั้น (ภาพแรกๆ คือภาพที่คนเห็นก่อน ควรเป็นภาพเด่น)

   TODO: ยังไม่มีภาพอีเวนต์จริง — เมื่อมีแล้วให้เพิ่มภาพ category: 'event' ที่นี่
         และเพิ่มบล็อก .gallery__group ของอีเวนต์ใน index.html (มีตัวอย่างคอมเมนต์ไว้) */
const GALLERY = [
  /* ---- graduation (85 ภาพ) ---- */
  { src: 'images/graduation/graduation-56.jpg', category: 'graduation', title: 'แก๊งเพื่อนหน้ามหาลัย', alt: 'เพื่อนบัณฑิตหญิงสี่คนกอดคอหัวเราะหน้าป้ายมหาวิทยาลัย', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-03-portrait.jpg', category: 'graduation', title: 'เดินเคียงกัน', alt: 'คู่บัณฑิตจับมือเดินด้วยกันหน้าอาคารกระจกสีขาว', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-07-portrait.jpg', category: 'graduation', title: 'ซุ้มดอกไม้สีส้ม', alt: 'บัณฑิตหญิงถือช่อดอกทานตะวัน ยืนยิ้มข้างซุ้มดอกไม้สีส้ม', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-14.jpg', category: 'graduation', title: 'คู่บัณฑิต', alt: 'คู่บัณฑิตยืนชิดกันถือของที่ระลึก ระหว่างผนังระแนงสีส้ม', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-69-portrait.jpg', category: 'graduation', title: 'ถือปกปริญญา', alt: 'พยาบาลชุดขาวชูปกใบปริญญาสีส้ม', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-09-portrait.jpg', category: 'graduation', title: 'แคนดิดระหว่างเดิน', alt: 'บัณฑิตหญิงถือช่อดอกไม้เดินข้ามถนน หันมายิ้มให้กล้อง', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-66.jpg', category: 'graduation', title: 'ภาพครอบครัว', alt: 'บัณฑิตหญิงถือช่อดอกไม้ถ่ายภาพกับพ่อแม่และน้องสาว', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-26-portrait.jpg', category: 'graduation', title: 'หน้าต่างบานเปิด', alt: 'คู่บัณฑิตโน้มตัวออกจากหน้าต่างกระจก ยิ้มสดใส', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-47.jpg', category: 'graduation', title: 'หัวเราะด้วยกัน', alt: 'เพื่อนบัณฑิตหญิงสามคนยกมือปิดปากหัวเราะ', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-11-portrait.jpg', category: 'graduation', title: 'มุมสนุกของคู่รัก', alt: 'คู่บัณฑิตโผล่หน้ายิ้มจากระหว่างผนังระแนงสีส้ม', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-59.jpg', category: 'graduation', title: 'ชูดอกไม้ขึ้นฟ้า', alt: 'ภาพมุมต่ำ เพื่อนบัณฑิตชูดอกไม้ขึ้นฟ้าพร้อมกัน', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-73-portrait.jpg', category: 'graduation', title: 'นั่งบนบันได', alt: 'บัณฑิตหญิงนั่งบนขั้นบันไดสีขาว', width: 1064, height: 1600 },
  { src: 'images/graduation/graduation-33-portrait.jpg', category: 'graduation', title: 'รอยยิ้มสดใส', alt: 'บัณฑิตหญิงยิ้มกว้างพิงพนักม้านั่งไม้', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-28.jpg', category: 'graduation', title: 'ผ่านกระจก', alt: 'บัณฑิตชายแตะจมูกบัณฑิตหญิงอย่างน่ารัก ถ่ายผ่านกระจก', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-40.jpg', category: 'graduation', title: 'ยิ้มหลับตา', alt: 'บัณฑิตหญิงหลับตายิ้มพิงราวระเบียง ฉากหลังผืนน้ำสีเขียว', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-30-portrait.jpg', category: 'graduation', title: 'ซิลูเอตขาวดำ', alt: 'ภาพขาวดำ เงาบัณฑิตสามคนโพสท่าหน้าหน้าต่างสูง', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-01-portrait.jpg', category: 'graduation', title: 'ภาพเดี่ยวบัณฑิต', alt: 'บัณฑิตหญิงในชุดครุยยืนพิงราวระเบียงสีขาว ด้านหลังเป็นหน้าต่างลายข้าวหลามตัด', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-02.jpg', category: 'graduation', title: 'ช่อทานตะวัน', alt: 'บัณฑิตหญิงนอนหงายกอดช่อดอกทานตะวัน แสงโทนอุ่น', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-04.jpg', category: 'graduation', title: 'ถ่ายยามค่ำ', alt: 'บัณฑิตหญิงชูช่อดอกทานตะวันยามค่ำคืน ฉากหลังเป็นแสงไฟเบลอ', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-05.jpg', category: 'graduation', title: 'คู่รักวันรับ', alt: 'บัณฑิตชายเอื้อมมือแตะแก้มบัณฑิตหญิงข้างผนังกระจก', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-06-portrait.jpg', category: 'graduation', title: 'รายละเอียดช่อดอกไม้', alt: 'ภาพใกล้ช่อดอกไม้ในอ้อมแขนบัณฑิต แสงอุ่นนุ่มละมุน', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-08-portrait.jpg', category: 'graduation', title: 'ซ้อมใหญ่', alt: 'นักศึกษาหญิงพาดครุยไว้ที่แขน ยืนจัดผมข้างเสาอาคารสีขาว', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-10.jpg', category: 'graduation', title: 'ยิ้มให้กัน', alt: 'คู่บัณฑิตยืนยิ้มให้กันหน้าผนังกระจก', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-12.jpg', category: 'graduation', title: 'ผนังระแนงสีส้ม', alt: 'คู่บัณฑิตยืนคนละฝั่งของผนังระแนงสีส้มหน้าอาคารเรียน', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-13-portrait.jpg', category: 'graduation', title: 'ของที่ระลึก', alt: 'คู่บัณฑิตยื่นของที่ระลึกชิ้นเล็กเข้าหากล้อง โฟกัสที่มือ', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-15-portrait.jpg', category: 'graduation', title: 'ท่านั่งสบายๆ', alt: 'บัณฑิตชายนั่งพิงระเบียงบนพื้นกระเบื้องสีแดง', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-16-portrait.jpg', category: 'graduation', title: 'โคลสอัพบัณฑิต', alt: 'ภาพใกล้บัณฑิตชายจัดผมมองกล้อง', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-17-portrait.jpg', category: 'graduation', title: 'ช่วงเวลาแคนดิด', alt: 'บัณฑิตหญิงก้มมองมือขณะคู่ของเธอยืนข้างกัน ฉากหลังระแนงสีส้ม', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-18-portrait.jpg', category: 'graduation', title: 'ชุดนักศึกษาพยาบาล', alt: 'นักศึกษาพยาบาลชุดฟ้าขาวนั่งที่โต๊ะหินหน้ากำแพงสีขาว', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-19.jpg', category: 'graduation', title: 'มุมกล้องสร้างสรรค์', alt: 'บัณฑิตชายนั่งพิงราวระเบียงสีขาว ถ่ายจากมุมเฉียง', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-20-portrait.jpg', category: 'graduation', title: 'ผ่านช่องระแนง', alt: 'คู่บัณฑิตยิ้มมองกล้องผ่านช่องระแนงสีส้ม', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-21-portrait.jpg', category: 'graduation', title: 'พอร์ตเดี่ยว', alt: 'นักศึกษาพยาบาลชุดฟ้าขาวนั่งยิ้ม เอียงศีรษะแตะแก้ม', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-22.jpg', category: 'graduation', title: 'ภาพหมู่ซ้อมใหญ่', alt: 'กลุ่มนักศึกษาหญิงยืนเรียงแถวโบกมือใต้หลังคาลานกีฬา', width: 1600, height: 1064 },
  { src: 'images/graduation/graduation-23.jpg', category: 'graduation', title: 'หน้าป้ายคณะ', alt: 'บัณฑิตชายพิงราวหน้าป้ายคณะครุศาสตร์', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-24-portrait.jpg', category: 'graduation', title: 'แก๊งเพื่อนสาว', alt: 'เพื่อนบัณฑิตหญิงสามคนหยอกล้อกันที่มุมห้องสีขาว', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-25.jpg', category: 'graduation', title: 'ยิ้มกว้าง', alt: 'บัณฑิตชายยิ้มกว้างโผล่หน้าจากช่องหน้าต่างสีขาว', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-27-portrait.jpg', category: 'graduation', title: 'หน้าคณะ', alt: 'บัณฑิตชายยืนข้างแท่นป้ายโลโก้คณะครุศาสตร์', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-29-portrait.jpg', category: 'graduation', title: 'ซ่อนหา', alt: 'บัณฑิตหญิงโผล่หน้ายิ้มจากหลังเสาสีขาว', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-31-portrait.jpg', category: 'graduation', title: 'ม่านสีฟ้า', alt: 'บัณฑิตชายยืนแหวกม่านกำมะหยี่สีฟ้า', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-32-portrait.jpg', category: 'graduation', title: 'พยาบาลกับสีเขียว', alt: 'นักศึกษาพยาบาลชุดฟ้าขาวยืนหน้าพุ่มไม้สีเขียว', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-34-portrait.jpg', category: 'graduation', title: 'ช่อยิปโซ', alt: 'บัณฑิตหญิงถือช่อยิปโซ ยืนพิงประตูสีขาว', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-35.jpg', category: 'graduation', title: 'ขาวดำสโลว์ชัตเตอร์', alt: 'ภาพขาวดำเทคนิคสโลว์ชัตเตอร์ บัณฑิตยืนในโถงทางเดิน', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-36-portrait.jpg', category: 'graduation', title: 'ชุดปกติขาว', alt: 'นักศึกษาหญิงชุดปกติขาวนั่งบนขอบปูน โบกมือยิ้ม', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-37-portrait.jpg', category: 'graduation', title: 'มือรูปหัวใจ', alt: 'นักศึกษาพยาบาลชุดฟ้าขาวทำมือรูปหัวใจข้างระเบียง', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-38.jpg', category: 'graduation', title: 'นั่งคุยกันสบายๆ', alt: 'คู่บัณฑิตนั่งคุยกันที่โต๊ะไม้ในโรงอาหาร', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-39-portrait.jpg', category: 'graduation', title: 'วิวภูเขา', alt: 'นักศึกษาพยาบาลจัดผมยิ้ม ยืนข้างระเบียงที่มองเห็นภูเขา', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-41.jpg', category: 'graduation', title: 'ระเบียงชมวิว', alt: 'นักศึกษาพยาบาลยืนพิงระเบียง มีต้นไม้และภูเขาเป็นฉากหลัง', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-42-portrait.jpg', category: 'graduation', title: 'หมวกพยาบาล', alt: 'พยาบาลจบใหม่ในชุดขาวสวมหมวกพยาบาล นั่งยิ้มบนบันได', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-43-portrait.jpg', category: 'graduation', title: 'แสงธรรมชาติ', alt: 'บัณฑิตหญิงยิ้มถือช่อยิปโซ ฉากหลังต้นไม้เบลอ', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-44-portrait.jpg', category: 'graduation', title: 'รายละเอียดชุดครุย', alt: 'ภาพใกล้แถบสีบนชุดครุยและเข็มกลัดของบัณฑิต', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-45-portrait.jpg', category: 'graduation', title: 'ท่าโพสสนุก', alt: 'พยาบาลชุดขาวสวมหมวกพยาบาล ก้มตัวยิ้มข้างโต๊ะ', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-46-portrait.jpg', category: 'graduation', title: 'ชุดปกติขาว', alt: 'นักศึกษาหญิงชุดปกติขาวยิ้ม เอามือแตะคาง', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-48-portrait.jpg', category: 'graduation', title: 'แฟลชมือถือ', alt: 'บัณฑิตหญิงสองคนนั่งมุมห้อง คนหนึ่งยกมือถือเปิดแฟลชเข้าหากล้อง', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-49.jpg', category: 'graduation', title: 'บรรยากาศมหาวิทยาลัย', alt: 'อาคารเรียนสีแดงถ่ายจากมุมเงย ตัดกับท้องฟ้าสีขาว', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-50.jpg', category: 'graduation', title: 'ในหอประชุม', alt: 'เพื่อนบัณฑิตหญิงสามคนนั่งคุยกันบนเก้าอี้หอประชุมสีเหลือง', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-51.jpg', category: 'graduation', title: 'มุมสูงบนบันได', alt: 'คู่บัณฑิตนอนบนขั้นบันไดสีขาว ถ่ายจากมุมสูง', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-52.jpg', category: 'graduation', title: 'ฉากหน้าเบลอ', alt: 'นักศึกษาหญิงชุดปกติขาวคลุมครุยก้มยิ้ม ถ่ายลอดฉากหน้าเบลอ', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-53.jpg', category: 'graduation', title: 'โถงบันได', alt: 'คู่บัณฑิตยืนที่ชานพักบันไดหน้าหน้าต่างบานใหญ่', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-54.jpg', category: 'graduation', title: 'ทางเดินสีขาว', alt: 'บัณฑิตหญิงสี่คนยืนเรียงในทางเดิน ถือครุยไว้ด้านหลัง', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-55.jpg', category: 'graduation', title: 'เงาขาวดำ', alt: 'ภาพขาวดำ บัณฑิตสี่คนโพสท่าหน้าหน้าต่างสูง', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-57-portrait.jpg', category: 'graduation', title: 'ส่งหัวใจ', alt: 'เพื่อนบัณฑิตทำมือรูปหัวใจ ฉากหลังเป็นสนามหญ้าและท้องฟ้า', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-58.jpg', category: 'graduation', title: 'ดอกไม้สีขาว', alt: 'ภาพใกล้มือบัณฑิตหลายคนถือดอกไม้สีขาว', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-60-portrait.jpg', category: 'graduation', title: 'ประติมากรรมเหล็ก', alt: 'เพื่อนบัณฑิตหญิงนั่งเบียดกันในประติมากรรมเหล็กทรงกลม', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-61-portrait.jpg', category: 'graduation', title: 'หน้าป้ายบอกทาง', alt: 'เพื่อนบัณฑิตหญิงกอดกันหน้าป้ายบอกทางในมหาวิทยาลัย', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-62.jpg', category: 'graduation', title: 'เซลฟี่กับเพื่อน', alt: 'เพื่อนบัณฑิตถ่ายเซลฟี่ เห็นภาพในจอมือถือคมชัด', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-63-portrait.jpg', category: 'graduation', title: 'มุมเอียงมีสไตล์', alt: 'บัณฑิตหญิงยืนพิงราวบันได ถ่ายจากมุมเอียง', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-64-portrait.jpg', category: 'graduation', title: 'ชุดปกติขาวกับเสาขาว', alt: 'บัณฑิตหญิงในชุดปกติขาวยืนพิงราวระหว่างเสาสีขาว', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-65-portrait.jpg', category: 'graduation', title: 'ยิ้มรับวันสำคัญ', alt: 'บัณฑิตหญิงยิ้มกว้างพิงม้านั่งไม้กลางแจ้ง', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-67-portrait.jpg', category: 'graduation', title: 'พยาบาลจบใหม่', alt: 'พยาบาลชุดขาวสวมหมวกพยาบาลนั่งเท้าคางในห้องเรียน', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-68-portrait.jpg', category: 'graduation', title: 'ม้านั่งกลางสนาม', alt: 'พยาบาลชุดขาวนั่งยิ้มบนม้านั่งไม้ ฉากหลังสนามหญ้า', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-70-portrait.jpg', category: 'graduation', title: 'เหลียวหลัง', alt: 'บัณฑิตหญิงหันหลังเหลียวมองกล้องในโถงสีขาว', width: 1064, height: 1600 },
  { src: 'images/graduation/graduation-71-portrait.jpg', category: 'graduation', title: 'โทนขาวสะอาด', alt: 'บัณฑิตหญิงแตะแก้มยืนในโถงสีขาวสว่าง', width: 1064, height: 1600 },
  { src: 'images/graduation/graduation-72-portrait.jpg', category: 'graduation', title: 'แสงจากหน้าต่าง', alt: 'บัณฑิตหญิงยกมือบังแสง มองขึ้นข้างหน้าต่าง', width: 1064, height: 1600 },
  { src: 'images/graduation/graduation-74-portrait.jpg', category: 'graduation', title: 'ภาพครึ่งตัว', alt: 'บัณฑิตหญิงประสานมือใต้คาง ภาพครึ่งตัวโทนสว่าง', width: 1064, height: 1600 },
  { src: 'images/graduation/graduation-75-portrait.jpg', category: 'graduation', title: 'คอลลาจทานตะวัน', alt: 'ภาพคอลลาจสามภาพ บัณฑิตหญิงกับช่อดอกทานตะวัน', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-76.jpg', category: 'graduation', title: 'หน้าป้ายมหาวิทยาลัย', alt: 'บัณฑิตหญิงสี่คนจับมือเดินหน้าป้ายมหาวิทยาลัย', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-77.jpg', category: 'graduation', title: 'สองอิริยาบถ', alt: 'ภาพคู่ นักศึกษาพยาบาลโพสสองท่าข้างระเบียง', width: 1600, height: 1066 },
  { src: 'images/graduation/graduation-78.jpg', category: 'graduation', title: 'คอลลาจสามท่า', alt: 'ภาพสามช่อง นักศึกษาพยาบาลสวมหมวกโพสท่าหน้าประตู', width: 1600, height: 1066 },
  { src: 'images/graduation/graduation-79-portrait.jpg', category: 'graduation', title: 'โทนใสละมุน', alt: 'บัณฑิตหญิงสวมแว่นยิ้ม เอามือแตะกรอบแว่น ภาพโทนสว่าง', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-80-portrait.jpg', category: 'graduation', title: 'ช่อดอกไม้สีขาว', alt: 'บัณฑิตหญิงสวมแว่นถือช่อดอกไม้สีขาว ยืนข้างราวบันได', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-81.jpg', category: 'graduation', title: 'คอลลาจวันรับ', alt: 'ภาพคอลลาจสี่ภาพ นักศึกษาพยาบาลถือช่อดอกไม้และรายละเอียดชุด', width: 1600, height: 1600 },
  { src: 'images/graduation/graduation-82-portrait.jpg', category: 'graduation', title: 'เพื่อนมาแสดงความยินดี', alt: 'บัณฑิตกับเพื่อนสาวทำท่ามือแนบแก้มใต้ต้นไม้', width: 1066, height: 1600 },
  { src: 'images/graduation/graduation-83-portrait.jpg', category: 'graduation', title: 'ช่อดอกไม้วันรับ', alt: 'บัณฑิตหญิงถือช่อดอกไม้และดอกทานตะวัน เอามือแตะผม', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-84-portrait.jpg', category: 'graduation', title: 'ซ้อมใหญ่ในโถงสว่าง', alt: 'นักศึกษาหญิงยิ้มพิงราว ด้านหลังเป็นหน้าต่างลายข้าวหลามตัด', width: 1065, height: 1600 },
  { src: 'images/graduation/graduation-85.jpg', category: 'graduation', title: 'รายละเอียดบนสนาม', alt: 'ภาพช่วงล่างของบัณฑิตสามคนยืนบนพื้นสนามสีแดง', width: 1600, height: 1065 },

  /* ---- wedding (30 ภาพ) ---- */
  { src: 'images/wedding/wedding-21.jpg', category: 'wedding', title: 'โปรยกลีบดอกไม้', alt: 'บ่าวสาวยิ้มให้กันท่ามกลางกลีบดอกไม้ที่โปรยลงมา', width: 1600, height: 1065 },
  { src: 'images/wedding/wedding-12-portrait.jpg', category: 'wedding', title: 'บ่าวสาวชุดขาว', alt: 'เจ้าบ่าวชุดปกติขาวยืนคู่เจ้าสาวที่พนมมือ หน้าซุ้มดอกไม้', width: 1065, height: 1600 },
  { src: 'images/wedding/wedding-01-portrait.jpg', category: 'wedding', title: 'เจ้าสาวชุดไทย', alt: 'เจ้าสาวในชุดไทยสีเงินยืนยิ้ม ข้างฉากดอกไม้สีชมพู', width: 1065, height: 1600 },
  { src: 'images/wedding/wedding-18.jpg', category: 'wedding', title: 'พนมมือรับพร', alt: 'บ่าวสาวพนมมือยิ้มระหว่างพิธี แสงขาวนุ่ม', width: 1600, height: 1065 },
  { src: 'images/wedding/wedding-22-portrait.jpg', category: 'wedding', title: 'รินแชมเปญ', alt: 'เจ้าบ่าวรินแชมเปญ เจ้าสาวมองยิ้ม', width: 1065, height: 1600 },
  { src: 'images/wedding/wedding-16-portrait.jpg', category: 'wedding', title: 'ช่อดอกไม้ในมือ', alt: 'บ่าวสาวพิงกัน เจ้าสาวถือช่อดอกไม้สีชมพู ภาพใกล้', width: 1065, height: 1600 },
  { src: 'images/wedding/wedding-07.jpg', category: 'wedding', title: 'บ่าวสาวสายฮา', alt: 'เจ้าบ่าวใส่แว่นกันแดดกอดอก เจ้าสาวโบกมือยิ้มหน้าฉากดอกไม้', width: 1600, height: 1065 },
  { src: 'images/wedding/wedding-28-portrait.jpg', category: 'wedding', title: 'พิธีสงฆ์', alt: 'บ่าวสาวนั่งหันหลังฟังพระสวดหน้าฉากดอกไม้', width: 1064, height: 1600 },
  { src: 'images/wedding/wedding-04-portrait.jpg', category: 'wedding', title: 'ตักบาตรพิธีเช้า', alt: 'บ่าวสาวตักบาตรร่วมกันหน้าฉากดอกไม้สีแดงขาว', width: 1065, height: 1600 },
  { src: 'images/wedding/wedding-20-portrait.jpg', category: 'wedding', title: 'งานเลี้ยงฉลอง', alt: 'บ่าวสาวจับมือยืนหน้าซุ้มดอกไม้ เจ้าสาวในชุดเกาะอก', width: 1065, height: 1600 },
  { src: 'images/wedding/wedding-11-portrait.jpg', category: 'wedding', title: 'มินิฮาร์ท', alt: 'บ่าวสาวทำมือรูปหัวใจ มีญาติยืนอยู่ด้านหลัง', width: 1065, height: 1600 },
  { src: 'images/wedding/wedding-13.jpg', category: 'wedding', title: 'พิธีรดน้ำสังข์', alt: 'ผู้ใหญ่รดน้ำสังข์อวยพรบ่าวสาว', width: 1600, height: 1065 },
  { src: 'images/wedding/wedding-29-portrait.jpg', category: 'wedding', title: 'สบตากัน', alt: 'บ่าวสาวยิ้มให้กัน เจ้าสาวถือช่อยิปโซ', width: 1064, height: 1600 },
  { src: 'images/wedding/wedding-24.jpg', category: 'wedding', title: 'เดินเข้างาน', alt: 'เจ้าบ่าวชุดปกติขาวเดินเคียงเจ้าสาวที่ถือช่อดอกไม้', width: 1600, height: 1065 },
  { src: 'images/wedding/wedding-27-portrait.jpg', category: 'wedding', title: 'ช่อยิปโซ', alt: 'เจ้าสาวชุดไทยนั่งก้มมองช่อยิปโซในมือ', width: 1064, height: 1600 },
  { src: 'images/wedding/wedding-14.jpg', category: 'wedding', title: 'ขบวนขันหมาก', alt: 'เจ้าบ่าวถือพานเดินในขบวนขันหมากใต้ร่มสีขาว', width: 1600, height: 1065 },
  { src: 'images/wedding/wedding-02-portrait.jpg', category: 'wedding', title: 'หน้าฉากถ่ายภาพ', alt: 'เจ้าสาวชุดไทยยืนยิ้มหน้าฉากชื่อบ่าวสาวและดอกไม้สีชมพู', width: 1065, height: 1600 },
  { src: 'images/wedding/wedding-03-portrait.jpg', category: 'wedding', title: 'รอยยิ้มเจ้าสาว', alt: 'เจ้าสาวยิ้มเขินประสานมือ หน้าฉากดอกไม้สีชมพู', width: 1065, height: 1600 },
  { src: 'images/wedding/wedding-05.jpg', category: 'wedding', title: 'เพื่อนแซวเจ้าบ่าว', alt: 'เจ้าบ่าวยืนกลางกลุ่มเพื่อนและญาติที่หัวเราะแซว', width: 1600, height: 1065 },
  { src: 'images/wedding/wedding-06.jpg', category: 'wedding', title: 'ฉากดอกไม้โทนฟ้า', alt: 'บ่าวสาวยืนหน้าฉากดอกไม้โทนฟ้าขาว', width: 1600, height: 1066 },
  { src: 'images/wedding/wedding-08-portrait.jpg', category: 'wedding', title: 'เจ้าสาวชุดขาว', alt: 'เจ้าสาวชุดไทยสีขาวนั่งพนมมือยิ้ม', width: 1065, height: 1600 },
  { src: 'images/wedding/wedding-09-portrait.jpg', category: 'wedding', title: 'ซุ้มดอกไม้', alt: 'เจ้าสาวนั่งเก้าอี้สีขาวหน้าซุ้มดอกไม้สีชมพูแดง', width: 1065, height: 1600 },
  { src: 'images/wedding/wedding-10.jpg', category: 'wedding', title: 'กับครอบครัว', alt: 'บ่าวสาวยิ้มโบกมือ ล้อมรอบด้วยครอบครัว', width: 1600, height: 1065 },
  { src: 'images/wedding/wedding-15-portrait.jpg', category: 'wedding', title: 'มอบช่อดอกไม้', alt: 'เจ้าบ่าวคุกเข่ายื่นช่อดอกไม้ให้เจ้าสาว', width: 1065, height: 1600 },
  { src: 'images/wedding/wedding-17-portrait.jpg', category: 'wedding', title: 'กราบผู้ใหญ่', alt: 'บ่าวสาวพนมมือก้มกราบ มีญาติมองอยู่ด้านหลัง', width: 1065, height: 1600 },
  { src: 'images/wedding/wedding-19-portrait.jpg', category: 'wedding', title: 'รายละเอียดพิธีรดน้ำ', alt: 'ภาพใกล้มือเจ้าสาวรับน้ำสังข์ มีดอกกุหลาบสีชมพูอยู่ฉากหน้า', width: 1065, height: 1600 },
  { src: 'images/wedding/wedding-23.jpg', category: 'wedding', title: 'ไฮไลต์บนเวที', alt: 'บ่าวสาวยิ้มดึงริบบิ้นบนเวทีงานเลี้ยง', width: 1600, height: 1065 },
  { src: 'images/wedding/wedding-25.jpg', category: 'wedding', title: 'เกี่ยวก้อย', alt: 'บ่าวสาวเกี่ยวก้อยกัน มีญาติชุดชมพูอยู่ด้านหลัง', width: 1600, height: 1065 },
  { src: 'images/wedding/wedding-26.jpg', category: 'wedding', title: 'รายละเอียดวันงาน', alt: 'ภาพคอลลาจสามภาพ ตุ๊กตาหมี เจ้าสาว และโคมไฟ', width: 1600, height: 1066 },
  { src: 'images/wedding/wedding-30-portrait.jpg', category: 'wedding', title: 'น้ำตาแห่งความสุข', alt: 'เจ้าสาวนั่งซับน้ำตาหน้าฉากผ้าม่านสีขาว', width: 1064, height: 1600 },

  /* ---- portfolio (38 ภาพ) ---- */
  { src: 'images/portfolio/portfolio-22.jpg', category: 'portfolio', title: 'วงกลมบนสนามหญ้า', alt: 'นักเรียนนอนหันศีรษะเข้าหากันเป็นวงกลมบนสนามหญ้า', width: 1600, height: 1065 },
  { src: 'images/portfolio/portfolio-07-portrait.jpg', category: 'portfolio', title: 'พอร์ตสายวิทย์', alt: 'นักเรียนหญิงกอดหนังสือชีววิทยา ยืนบนสะพานแขวน', width: 1065, height: 1600 },
  { src: 'images/portfolio/portfolio-21.jpg', category: 'portfolio', title: 'จับมือชูฟ้า', alt: 'ภาพมุมต่ำ เพื่อนนักเรียนจับมือชูขึ้นฟ้าสีคราม', width: 1600, height: 1065 },
  { src: 'images/portfolio/portfolio-30-portrait.jpg', category: 'portfolio', title: 'พอร์ตบนลู่วิ่ง', alt: 'นักเรียนหญิงนั่งเท้าคางบนลู่วิ่งสีแดง', width: 1065, height: 1600 },
  { src: 'images/portfolio/portfolio-17.jpg', category: 'portfolio', title: 'ชูแขนดีใจ', alt: 'นักเรียนชายหญิงชูแขนหัวเราะอย่างดีใจ', width: 1600, height: 1065 },
  { src: 'images/portfolio/portfolio-32-portrait.jpg', category: 'portfolio', title: 'แก๊งเพื่อนสาว', alt: 'เพื่อนนักเรียนหญิงกลุ่มใหญ่ยืนเบียดกันในทางเดิน', width: 1064, height: 1600 },
  { src: 'images/portfolio/portfolio-23.jpg', category: 'portfolio', title: 'โยนรองเท้าฉลองจบ', alt: 'เพื่อนนักเรียนโยนรองเท้าขึ้นฟ้าอย่างสนุกสนาน', width: 1600, height: 1065 },
  { src: 'images/portfolio/portfolio-03-portrait.jpg', category: 'portfolio', title: 'ผนังสีส้ม', alt: 'นักเรียนหญิงจัดผมยืนหน้าผนังสีส้มและหน้าต่างสีเขียว', width: 1065, height: 1600 },
  { src: 'images/portfolio/portfolio-37.jpg', category: 'portfolio', title: 'เงาของเรา', alt: 'เพื่อนนักเรียนจับมือเรียงแถวย้อนแสง เงาทอดยาวบนพื้น', width: 1600, height: 1064 },
  { src: 'images/portfolio/portfolio-02-portrait.jpg', category: 'portfolio', title: 'สะพานแขวน', alt: 'นักเรียนหญิงยืนยิ้มบนสะพานแขวนสีขาว', width: 1065, height: 1600 },
  { src: 'images/portfolio/portfolio-16.jpg', category: 'portfolio', title: 'นั่งเล่นบนสนามหญ้า', alt: 'นักเรียนชายหญิงนั่งเอียงศีรษะชนกันบนสนามหญ้า', width: 1600, height: 1065 },
  { src: 'images/portfolio/portfolio-12-portrait.jpg', category: 'portfolio', title: 'ท่าโพสขี้เล่น', alt: 'นักเรียนหญิงวางหนังสือบนศีรษะยิ้มในทางเดิน', width: 1065, height: 1600 },
  { src: 'images/portfolio/portfolio-28.jpg', category: 'portfolio', title: 'ชูแขนพร้อมกัน', alt: 'เพื่อนนักเรียนชูแขนขึ้นฟ้าพร้อมกัน', width: 1600, height: 1065 },
  { src: 'images/portfolio/portfolio-06.jpg', category: 'portfolio', title: 'มุมสูงบนพื้นสีส้ม', alt: 'นักเรียนหญิงนอนหลับตายิ้มบนพื้นสีส้ม ถ่ายจากมุมสูง', width: 1600, height: 1065 },
  { src: 'images/portfolio/portfolio-36-portrait.jpg', category: 'portfolio', title: 'อัดแน่นในลิฟต์', alt: 'เพื่อนนักเรียนเบียดกันในลิฟต์ ทำมือวงกลมที่ตา', width: 1064, height: 1600 },
  { src: 'images/portfolio/portfolio-20.jpg', category: 'portfolio', title: 'นอนบนสนามหญ้า', alt: 'นักเรียนชายหญิงนอนบนสนามหญ้าหันหน้าเข้าหากัน', width: 1600, height: 1065 },
  { src: 'images/portfolio/portfolio-01-portrait.jpg', category: 'portfolio', title: 'วันปัจฉิม', alt: 'นักเรียนหญิงสวมสายสะพายแสดงความยินดี ทำท่าน่ารักให้กล้อง', width: 1065, height: 1600 },
  { src: 'images/portfolio/portfolio-04.jpg', category: 'portfolio', title: 'สนามวอลเลย์บอล', alt: 'นักเรียนหญิงยืนหลังตาข่ายวอลเลย์บอล', width: 1600, height: 1065 },
  { src: 'images/portfolio/portfolio-05-portrait.jpg', category: 'portfolio', title: 'โทนสีส้มสดใส', alt: 'นักเรียนหญิงนั่งบนพื้นสีส้ม เอามือจับผม', width: 1065, height: 1600 },
  { src: 'images/portfolio/portfolio-08-portrait.jpg', category: 'portfolio', title: 'โปรไฟล์ยื่นมหาลัย', alt: 'นักเรียนหญิงถือหนังสือชีววิทยายิ้ม ข้างราวสะพาน', width: 1065, height: 1600 },
  { src: 'images/portfolio/portfolio-09-portrait.jpg', category: 'portfolio', title: 'ทางเดินอาคารเรียน', alt: 'นักเรียนหญิงนั่งเก้าอี้ในทางเดินอาคาร เอามือจับผม', width: 1065, height: 1600 },
  { src: 'images/portfolio/portfolio-10-portrait.jpg', category: 'portfolio', title: 'แสงธรรมชาติ', alt: 'นักเรียนหญิงนั่งเท้าคางบนเก้าอี้ แสงธรรมชาติ', width: 1065, height: 1600 },
  { src: 'images/portfolio/portfolio-11-portrait.jpg', category: 'portfolio', title: 'ยิ้มสดใส', alt: 'นักเรียนหญิงหลับตายิ้มบนสะพานแขวน', width: 1065, height: 1600 },
  { src: 'images/portfolio/portfolio-13-portrait.jpg', category: 'portfolio', title: 'หยอกล้อกับเพื่อน', alt: 'นักเรียนชายหญิงหยอกล้อกันข้างหน้าต่าง', width: 1065, height: 1600 },
  { src: 'images/portfolio/portfolio-14.jpg', category: 'portfolio', title: 'ห้องเรียนศิลปะ', alt: 'นักเรียนชายหญิงนั่งที่โต๊ะเรียนในห้องศิลปะ', width: 1600, height: 1065 },
  { src: 'images/portfolio/portfolio-15.jpg', category: 'portfolio', title: 'เกี่ยวก้อยเพื่อนซี้', alt: 'นักเรียนชายหญิงเกี่ยวก้อยกันมองกล้อง', width: 1600, height: 1065 },
  { src: 'images/portfolio/portfolio-18.jpg', category: 'portfolio', title: 'วิ่งเล่นในสนาม', alt: 'นักเรียนชายหญิงจับมือวิ่งบนสนามหญ้า', width: 1600, height: 1065 },
  { src: 'images/portfolio/portfolio-19-portrait.jpg', category: 'portfolio', title: 'เนินหญ้ามุมต่ำ', alt: 'นักเรียนชายหญิงเดินบนเนินหญ้า ถ่ายจากมุมต่ำ', width: 1065, height: 1600 },
  { src: 'images/portfolio/portfolio-24-portrait.jpg', category: 'portfolio', title: 'สนามฟุตบอล', alt: 'เพื่อนนักเรียนวิ่งบนสนามฟุตบอล ใต้ท้องฟ้าเมฆขาว', width: 1065, height: 1600 },
  { src: 'images/portfolio/portfolio-25.jpg', category: 'portfolio', title: 'ขี่หลังเพื่อน', alt: 'นักเรียนขี่หลังเพื่อนเดินบนสนามหญ้า', width: 1600, height: 1065 },
  { src: 'images/portfolio/portfolio-26.jpg', category: 'portfolio', title: 'บอกลารองเท้านักเรียน', alt: 'เพื่อนนักเรียนรวมตัวทิ้งรองเท้านักเรียนลงถังสีเหลือง', width: 1600, height: 1065 },
  { src: 'images/portfolio/portfolio-27.jpg', category: 'portfolio', title: 'ภาพหมู่มุมต่ำ', alt: 'ภาพมุมต่ำ เพื่อนนักเรียนยืนเรียงแถวใต้ท้องฟ้าสีฟ้า', width: 1600, height: 1065 },
  { src: 'images/portfolio/portfolio-29-portrait.jpg', category: 'portfolio', title: 'ลู่วิ่งสีแดง', alt: 'นักเรียนหญิงยืนจับผมบนลู่วิ่งสีแดง', width: 1065, height: 1600 },
  { src: 'images/portfolio/portfolio-31-portrait.jpg', category: 'portfolio', title: 'ขยิบตา', alt: 'นักเรียนหญิงนั่งยิ้มขยิบตาบนลู่วิ่งสีแดง', width: 1065, height: 1600 },
  { src: 'images/portfolio/portfolio-33-portrait.jpg', category: 'portfolio', title: 'หัวเราะด้วยกัน', alt: 'เพื่อนนักเรียนหญิงหัวเราะกระซิบกันในทางเดิน', width: 1064, height: 1600 },
  { src: 'images/portfolio/portfolio-34-portrait.jpg', category: 'portfolio', title: 'มุมผนังช่องลม', alt: 'เพื่อนนักเรียนหญิงนั่งเรียงกันที่มุมผนังช่องลมสีขาว', width: 1064, height: 1600 },
  { src: 'images/portfolio/portfolio-35-portrait.jpg', category: 'portfolio', title: 'ประตูลิฟต์', alt: 'เพื่อนนักเรียนโผล่หน้าจากประตูลิฟต์สองบาน', width: 1064, height: 1600 },
  { src: 'images/portfolio/portfolio-38-portrait.jpg', category: 'portfolio', title: 'คอลลาจเพื่อนรัก', alt: 'ภาพคอลลาจสามภาพ นักเรียนชายหญิงบนสนามหญ้า', width: 899, height: 1600 },
  /* ---- ordination (48 ภาพ) ---- */
  { src: 'images/ordination/ordination-46-portrait.jpg', category: 'ordination', title: 'โปสเตอร์นาคพนมมือ', alt: 'นาคพนมมือหน้าฉากดอกไม้สีส้มและป้ายงาน', width: 1066, height: 1600 },
  { src: 'images/ordination/ordination-23-portrait.jpg', category: 'ordination', title: 'นาคขึ้นบ่า', alt: 'นาคนั่งบนบ่าญาติพนมมือ ใต้ร่มสีทองท่ามกลางต้นไม้', width: 1065, height: 1600 },
  { src: 'images/ordination/ordination-05-portrait.jpg', category: 'ordination', title: 'นาคชุดเต็มยศ', alt: 'นาคสวมชฎาในชุดสีทองยืนหน้าเวทีพิธี', width: 1065, height: 1600 },
  { src: 'images/ordination/ordination-16-portrait.jpg', category: 'ordination', title: 'พระบวชใหม่', alt: 'พระบวชใหม่ยืนพนมมือหน้าพระพุทธรูปสีขาว', width: 1065, height: 1600 },
  { src: 'images/ordination/ordination-22.jpg', category: 'ordination', title: 'แห่นาค', alt: 'ญาติแห่นาคที่นั่งบนบ่าใต้ร่มสีทอง', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-43-portrait.jpg', category: 'ordination', title: 'รอยยิ้มของนาค', alt: 'นาคชุดสีทองพนมมือยิ้ม มองขึ้นด้านบน', width: 1065, height: 1600 },
  { src: 'images/ordination/ordination-10.jpg', category: 'ordination', title: 'ครองผ้าครั้งแรก', alt: 'พระพี่เลี้ยงช่วยจัดจีวรให้พระบวชใหม่', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-28.jpg', category: 'ordination', title: 'ภาพหมู่ครอบครัว', alt: 'ครอบครัวและญาติยืนถ่ายภาพหมู่กับนาคใต้ร่มสีทอง', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-33-portrait.jpg', category: 'ordination', title: 'ประตูโบสถ์', alt: 'พระบวชใหม่ยืนพนมมือที่ประตูโบสถ์ ภาพย้อนแสง', width: 1065, height: 1600 },
  { src: 'images/ordination/ordination-02.jpg', category: 'ordination', title: 'พิธีทำขวัญนาค', alt: 'นาคในชุดสีทองนั่งพนมมือหน้าบายศรีในพิธีทำขวัญนาค', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-27.jpg', category: 'ordination', title: 'มองฟ้า', alt: 'พระบวชใหม่เงยหน้ามองฟ้าสีคราม', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-24.jpg', category: 'ordination', title: 'แห่รอบโบสถ์', alt: 'ขบวนแห่นาครอบโบสถ์ ใต้ร่มสีทองและท้องฟ้าสดใส', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-42-portrait.jpg', category: 'ordination', title: 'ทางเดินในวัด', alt: 'พระบวชใหม่ยืนพนมมือบนทางเดินในวัด', width: 1066, height: 1600 },
  { src: 'images/ordination/ordination-13.jpg', category: 'ordination', title: 'ปลงผมขาวดำ', alt: 'ภาพขาวดำ ผู้ใหญ่กำลังโกนผมนาคที่หลับตา', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-47-portrait.jpg', category: 'ordination', title: 'ถือตาลปัตร', alt: 'พระบวชใหม่ถือตาลปัตรยืนหน้าพระพุทธรูปสีขาว', width: 1066, height: 1600 },
  { src: 'images/ordination/ordination-40.jpg', category: 'ordination', title: 'ในพระอุโบสถ', alt: 'พระบวชใหม่นั่งในพระอุโบสถที่ตกแต่งสีทอง', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-09-portrait.jpg', category: 'ordination', title: 'กราบพระบวชใหม่', alt: 'หญิงสาวนั่งพนมมือหน้าพระบวชใหม่บนทางเดินในวัด', width: 1066, height: 1600 },
  { src: 'images/ordination/ordination-01.jpg', category: 'ordination', title: 'รายละเอียดผ้าพิธี', alt: 'ภาพใกล้ผ้าลูกไม้สีขาวประดับพู่ในงานอุปสมบท', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-03.jpg', category: 'ordination', title: 'ลอดผ้าเหลือง', alt: 'นาคชุดขาวพนมมือ ถ่ายลอดผ่านผ้าสีเหลืองฉากหน้า', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-04.jpg', category: 'ordination', title: 'กล่าวคำขอบวช', alt: 'นาคในชุดสีทองพนมมือพูดใส่ไมโครโฟน', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-06-portrait.jpg', category: 'ordination', title: 'ดอกไม้ธูปเทียน', alt: 'ภาพใกล้มือนาคถือดอกไม้และธนบัตรพับ', width: 1065, height: 1600 },
  { src: 'images/ordination/ordination-07.jpg', category: 'ordination', title: 'ทำขวัญยามค่ำ', alt: 'นาคและญาติพนมมือยิ้ม ฉากหลังเป็นไฟประดับยามค่ำ', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-08.jpg', category: 'ordination', title: 'ปลงผม', alt: 'ภาพใกล้มือกำลังโกนผมนาค', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-11.jpg', category: 'ordination', title: 'ระเบียงโบสถ์', alt: 'พระบวชใหม่เดินตามพระพี่เลี้ยงข้างระเบียงโบสถ์สีขาว', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-12.jpg', category: 'ordination', title: 'จัดจีวร', alt: 'พระพี่เลี้ยงช่วยจัดจีวรให้พระบวชใหม่หน้าประตู', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-14.jpg', category: 'ordination', title: 'ญาติร่วมยินดี', alt: 'พระบวชใหม่ยืนท่ามกลางญาติที่ถ่ายรูปแสดงความยินดี', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-15.jpg', category: 'ordination', title: 'ลานพระพุทธรูป', alt: 'พระบวชใหม่เดินบนลานหน้าพระพุทธรูปสีขาวเรียงแถว', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-17.jpg', category: 'ordination', title: 'เวทีกราบอุปสมบท', alt: 'ฉากเวทีพิธีอุปสมบทตกแต่งดอกไม้สีขาวและธรรมจักร', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-18.jpg', category: 'ordination', title: 'รับพรจากผู้ใหญ่', alt: 'ผู้ใหญ่ป้อนขนมให้นาคในพิธีทำขวัญ', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-19.jpg', category: 'ordination', title: 'ป้ายงานบวช', alt: 'ป้ายชื่องานอุปสมบทบนผ้าม่านสีทอง', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-20-portrait.jpg', category: 'ordination', title: 'นาคชุดขาว', alt: 'นาคสวมหมวกและชุดขาว ถือดอกไม้ยืนหน้าป้ายงาน', width: 1065, height: 1600 },
  { src: 'images/ordination/ordination-21.jpg', category: 'ordination', title: 'รายละเอียดเวที', alt: 'บายศรีและเครื่องบวชหน้าเวทีกราบอุปสมบท', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-25-portrait.jpg', category: 'ordination', title: 'เข้าโบสถ์', alt: 'นาคชุดขาวพนมมือเดินเข้าโบสถ์', width: 1065, height: 1600 },
  { src: 'images/ordination/ordination-26.jpg', category: 'ordination', title: 'รายละเอียดจีวร', alt: 'ภาพใกล้มือพระถือซองปัจจัยข้างจีวร', width: 1600, height: 1064 },
  { src: 'images/ordination/ordination-29.jpg', category: 'ordination', title: 'ประนมมือในโบสถ์', alt: 'พระบวชใหม่พนมมือในโบสถ์', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-30.jpg', category: 'ordination', title: 'ขบวนแห่', alt: 'ขบวนแห่นาคพร้อมญาติถือเครื่องบวช', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-31.jpg', category: 'ordination', title: 'สะพายบาตร', alt: 'พระบวชใหม่สะพายบาตรเดินในวัด', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-32.jpg', category: 'ordination', title: 'ขาวดำในพิธี', alt: 'ภาพขาวดำ พระบวชใหม่พนมมือระหว่างพิธี', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-34.jpg', category: 'ordination', title: 'ขลิบผม', alt: 'พระกำลังขลิบผมนาคที่นั่งหน้าฉากดอกไม้', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-35.jpg', category: 'ordination', title: 'คอลลาจรายละเอียด', alt: 'ภาพคอลลาจเก้าช่อง รายละเอียดในงานบวช', width: 1600, height: 1600 },
  { src: 'images/ordination/ordination-36-portrait.jpg', category: 'ordination', title: 'โปสเตอร์นาค', alt: 'ภาพโปสเตอร์นาคชุดขาวพนมมือหน้าเวที', width: 1065, height: 1600 },
  { src: 'images/ordination/ordination-37.jpg', category: 'ordination', title: 'คอลลาจวันบวช', alt: 'ภาพคอลลาจสี่ช่อง การ์ดเชิญและพระบวชใหม่', width: 1600, height: 1600 },
  { src: 'images/ordination/ordination-38.jpg', category: 'ordination', title: 'บาตรพระ', alt: 'ภาพใกล้บาตรพระสะพายข้างจีวร', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-39-portrait.jpg', category: 'ordination', title: 'โปสเตอร์พระใหม่', alt: 'พระบวชใหม่ถือตาลปัตรยืนในวัด', width: 1066, height: 1600 },
  { src: 'images/ordination/ordination-41.jpg', category: 'ordination', title: 'ครองจีวร', alt: 'ภาพใกล้มือช่วยจัดจีวรให้พระบวชใหม่', width: 1600, height: 1065 },
  { src: 'images/ordination/ordination-44-portrait.jpg', category: 'ordination', title: 'หน้าโบสถ์', alt: 'พระบวชใหม่สวมแว่นยืนหน้าโบสถ์', width: 1066, height: 1600 },
  { src: 'images/ordination/ordination-45-portrait.jpg', category: 'ordination', title: 'ข้างโบสถ์', alt: 'พระบวชใหม่ยืนบนทางเดินข้างโบสถ์', width: 1066, height: 1600 },
  { src: 'images/ordination/ordination-48-portrait.jpg', category: 'ordination', title: 'พระใหม่กับบาตร', alt: 'พระบวชใหม่สะพายบาตรถือตาลปัตรข้างกำแพงวัด', width: 1066, height: 1600 },
];

/* ---------- ภาพหน้าปก (คอลัมน์ภาพเฉียง) ----------
   ใส่ src ของภาพที่มีอยู่ใน GALLERY — ต้องมีภาพย่อชื่อเดียวกันใน images/cover/ สร้างด้วย:
   sips -Z 560 -s formatOptions 70 images/<หมวด>/<ไฟล์>.jpg --out images/cover/<ไฟล์>.jpg
   ภาพยิ่งเยอะยิ่งไม่ซ้ำกันบนจอ (แนะนำ 40 ภาพขึ้นไป) */
const COVER = [
  'images/graduation/graduation-56.jpg',
  'images/wedding/wedding-21.jpg',
  'images/portfolio/portfolio-22.jpg',
  'images/graduation/graduation-03-portrait.jpg',
  'images/wedding/wedding-12-portrait.jpg',
  'images/portfolio/portfolio-07-portrait.jpg',
  'images/graduation/graduation-07-portrait.jpg',
  'images/wedding/wedding-01-portrait.jpg',
  'images/portfolio/portfolio-21.jpg',
  'images/graduation/graduation-14.jpg',
  'images/wedding/wedding-18.jpg',
  'images/portfolio/portfolio-30-portrait.jpg',
  'images/graduation/graduation-69-portrait.jpg',
  'images/wedding/wedding-22-portrait.jpg',
  'images/portfolio/portfolio-17.jpg',
  'images/graduation/graduation-09-portrait.jpg',
  'images/wedding/wedding-16-portrait.jpg',
  'images/portfolio/portfolio-32-portrait.jpg',
  'images/graduation/graduation-66.jpg',
  'images/wedding/wedding-07.jpg',
  'images/portfolio/portfolio-23.jpg',
  'images/graduation/graduation-26-portrait.jpg',
  'images/wedding/wedding-28-portrait.jpg',
  'images/portfolio/portfolio-03-portrait.jpg',
  'images/graduation/graduation-47.jpg',
  'images/wedding/wedding-04-portrait.jpg',
  'images/portfolio/portfolio-37.jpg',
  'images/graduation/graduation-11-portrait.jpg',
  'images/wedding/wedding-20-portrait.jpg',
  'images/portfolio/portfolio-02-portrait.jpg',
  'images/graduation/graduation-59.jpg',
  'images/wedding/wedding-11-portrait.jpg',
  'images/portfolio/portfolio-16.jpg',
  'images/graduation/graduation-73-portrait.jpg',
  'images/wedding/wedding-13.jpg',
  'images/portfolio/portfolio-12-portrait.jpg',
  'images/graduation/graduation-33-portrait.jpg',
  'images/wedding/wedding-29-portrait.jpg',
  'images/portfolio/portfolio-28.jpg',
  'images/graduation/graduation-28.jpg',
  'images/wedding/wedding-24.jpg',
  'images/portfolio/portfolio-06.jpg',
  'images/graduation/graduation-40.jpg',
  'images/wedding/wedding-27-portrait.jpg',
  'images/graduation/graduation-30-portrait.jpg',
];

/* ---------- แถบภาพวิ่ง (ระหว่างส่วน "ทำไมต้องเรา" กับ "บริการ") ----------
   ใส่ src ของภาพที่มีอยู่ใน GALLERY (คลิกแล้วเปิดภาพเต็มใน Lightbox) แบ่งวิ่งเป็น 2 แถวสลับทิศอัตโนมัติ
   ต้องมีภาพย่อชื่อเดียวกันใน images/strip/ สร้างด้วย:
   sips -Z 640 -s formatOptions 72 images/<หมวด>/<ไฟล์>.jpg --out images/strip/<ไฟล์>.jpg */
const STRIP = [
  'images/graduation/graduation-56.jpg',
  'images/wedding/wedding-21.jpg',
  'images/portfolio/portfolio-22.jpg',
  'images/graduation/graduation-03-portrait.jpg',
  'images/wedding/wedding-12-portrait.jpg',
  'images/portfolio/portfolio-07-portrait.jpg',
  'images/graduation/graduation-07-portrait.jpg',
  'images/wedding/wedding-01-portrait.jpg',
  'images/portfolio/portfolio-21.jpg',
  'images/graduation/graduation-11-portrait.jpg',
  'images/wedding/wedding-22-portrait.jpg',
  'images/portfolio/portfolio-30-portrait.jpg',
  'images/graduation/graduation-66.jpg',
  'images/wedding/wedding-16-portrait.jpg',
  'images/portfolio/portfolio-23.jpg',
  'images/graduation/graduation-69-portrait.jpg',
  'images/wedding/wedding-07.jpg',
  'images/portfolio/portfolio-32-portrait.jpg',
  'images/graduation/graduation-09-portrait.jpg',
  'images/wedding/wedding-28-portrait.jpg',
  'images/graduation/graduation-47.jpg',
  'images/wedding/wedding-04-portrait.jpg',
  'images/graduation/graduation-26-portrait.jpg',
  'images/graduation/graduation-59.jpg',
];

/* ---------- ระบบจองคิวออนไลน์ ----------
   หน้าจองอยู่ที่ booking.html — ข้อมูลส่งไปเก็บใน Google Sheets ผ่าน Google Apps Script (วิธีติดตั้ง: apps-script/SETUP.md)
   • ลิงก์ booking.html?type=wedding จะเลือกประเภทงานไว้ให้ (ใช้กับปุ่มจองในการ์ดบริการ)
   • types[].image = ภาพบนการ์ดเลือกประเภทงาน / price = ข้อความราคาใต้ชื่อ
   • endpoint ว่าง = หน้าจองจะแสดงข้อความให้ทักแชทแทนฟอร์ม
   • เวลาแพ็กเกจแก้ได้ที่ types ด้านล่าง (ranges = ช่วงเวลาตายตัว, hourly = จองรายชั่วโมง)
   • เวลากันไว้เดินทางก่อน-หลังงาน และวันจองล่วงหน้า ตั้งใน apps-script/Code.gs (CONFIG) */
const BOOKING = {
  endpoint: 'https://script.google.com/macros/s/AKfycbz1WzIcNMSfSm8xeSIXUJv9JoGqGa7q3YPse4vkdUHn8heyTdpvgxNuyLtI9cZM9DBo/exec',

  // แสดงในขั้นตอนแนบสลิป: QR ด้านบน แล้วตามด้วยธนาคาร / ชื่อบัญชี / เลขบัญชี (ช่องที่ว่างจะไม่แสดง)
  deposit: {
    note: 'โอนมัดจำเพื่อล็อกคิว ยอดมัดจำจะแจ้งให้ตอนยืนยันรายละเอียด', // TODO: ใส่ยอดมัดจำเมื่อกำหนดแล้ว
    qr: 'images/payment/promptpay-qr.png', // QR พร้อมเพย์ (062-234-9685)
    bank: 'ธนาคารไทยพาณิชย์ (SCB)',
    accountName: 'นายวชิรพล มะลิวัลย์',
    accountNo: '421-1-25593-9',
  },

  // เวลาเริ่มที่เลือกได้สำหรับงานรายชั่วโมง (ทุก 30 นาที)
  hourlyFrom: '06:00',
  hourlyUntil: '22:00', // ต้องถ่ายเสร็จไม่เกินเวลานี้

  // ranges = ช่วงเวลาตายตัว / hourly = เลือกเวลาเริ่มเอง (minHours–maxHours ชม.) / price = ข้อความราคาบนปุ่ม
  // ตัวเลขสำหรับคำนวณ "รวมค่าใช้จ่าย": amount = ราคาตายตัว / hourlyRate = ต่อชั่วโมง / pairRate = ราคาเหมา 2 ชม.
  //   days = จำนวนวันติดกัน (เช่นงานบวช 2 วัน) / addon: amount = ครั้งเดียว, perDay = คิดต่อวัน
  //   from: true = ราคาเริ่มต้น (แสดงว่า "เริ่มต้น")
  // addons = ตัวเลือกเพิ่มที่ลูกค้ากดเลือกได้ / note = หมายเหตุใต้ตัวเลือกแพ็กเกจ
  // ⚠️ ราคาให้ตรงกับการ์ดบริการใน index.html
  types: [
    { id: 'graduation', label: 'รับปริญญา', price: 'เริ่มต้น 1,200 บาท', image: 'images/strip/graduation-07-portrait.jpg', packages: [
      { id: 'hourly', label: 'รายชั่วโมง', price: '1,200 บาท/ชม.', hourlyRate: 1200, hourly: true, maxHours: 8 },
      { id: 'morning', label: 'ครึ่งวันเช้า', price: '3,500 บาท', amount: 3500, ranges: [['07:00', '12:00']] },
      { id: 'afternoon', label: 'ครึ่งวันบ่าย', price: '3,500 บาท', amount: 3500, ranges: [['13:00', '17:00']] },
      { id: 'fullday', label: 'เต็มวัน', price: '5,500 บาท', amount: 5500, ranges: [['07:00', '17:00']] },
    ] },
    { id: 'wedding', label: 'งานแต่ง', price: 'เริ่มต้น 5,500 บาท', image: 'images/strip/wedding-12-portrait.jpg',
      note: 'ช่างภาพ 1 คน กล้อง 2 ตัว + ไฟสตูดิโอ · ไม่จำกัดรูป · ราคายังไม่รวมค่าเดินทาง',
      addons: [
        { id: 'photographer', label: 'เพิ่มช่างภาพอีก 1 คน', detail: 'เก็บได้หลายมุมพร้อมกัน ไม่พลาดทุกช่วงสำคัญ', price: '+4,000 บาท', amount: 4000 },
      ],
      packages: [
      { id: 'ceremony', label: 'พิธีเช้า (เช้า–เที่ยง)', price: '5,500 บาท', amount: 5500, ranges: [['06:00', '12:00']] },
      { id: 'reception', label: 'งานเลี้ยง (เย็น–ดึก)', price: '5,500 บาท', amount: 5500, ranges: [['17:00', '22:00']] },
      { id: 'both', label: 'พิธีเช้า + งานเลี้ยง', price: '11,000 บาท', amount: 11000, ranges: [['06:00', '12:00'], ['17:00', '22:00']] }, // TODO: ยืนยันราคาเหมา 2 ช่วง
    ] },
    { id: 'prewedding', label: 'พรีเวดดิ้ง', price: 'สอบถามราคา', image: 'images/strip/wedding-16-portrait.jpg', packages: [
      { id: 'hourly', label: 'รายชั่วโมง', hourly: true, maxHours: 8 },
    ] },
    { id: 'portfolio', label: 'พอร์ตนักเรียน', price: 'เริ่มต้น 600 บาท', image: 'images/strip/portfolio-07-portrait.jpg', packages: [
      { id: 'solo', label: 'ถ่ายเดี่ยว', price: '600 บาท/ชม. · 2 ชม. 1,000', hourlyRate: 600, pairRate: 1000, hourly: true, maxHours: 4 },
      { id: 'small', label: 'กลุ่มเล็ก 2–3 คน', price: '1,200 บาท/ชม. · 2 ชม. 2,000', hourlyRate: 1200, pairRate: 2000, hourly: true, maxHours: 4 },
      { id: 'group6', label: 'กลุ่ม 4–6 คน', price: '2,300 บาท / 3 ชม.', amount: 2300, hourly: true, minHours: 3, maxHours: 3 },
      { id: 'group10', label: 'กลุ่ม 6–10 คน', price: '3,000 บาท / 3 ชม.', amount: 3000, hourly: true, minHours: 3, maxHours: 3 },
      { id: 'class', label: 'ถ่ายทั้งห้อง', price: 'เริ่มต้น 4,000 บาท / 3 ชม.', amount: 4000, from: true, hourly: true, minHours: 3, maxHours: 6 },
    ] },
    { id: 'ordination', label: 'งานอุปสมบท', price: 'เริ่มต้น 6,000 บาท', image: 'images/strip/ordination-46-portrait.jpg',
      note: 'ช่างภาพ 1 คน กล้อง 2 ตัว + ไฟสตูดิโอ · ไม่จำกัดรูป · ราคายังไม่รวมค่าเดินทาง',
      addons: [
        { id: 'photographer', label: 'เพิ่มช่างภาพอีก 1 คน', detail: 'เก็บได้หลายมุมพร้อมกัน ไม่พลาดทุกช่วงสำคัญ', price: '+3,000 บาท/วัน', perDay: 3000 },
      ],
      packages: [
      { id: 'day1', label: '1 วัน', price: '6,000 บาท', amount: 6000, ranges: [['06:00', '18:00']] },
      { id: 'day2', label: '2 วัน', price: '7,500 บาท', amount: 7500, days: 2, ranges: [['06:00', '18:00']] }, // days: 2 = ใช้ 2 วันติดกัน (วันที่เลือก + วันถัดไป)
    ] },
    // งานประเภทอื่น: ลูกค้าเลือกวันเวลา แล้วต้องเล่ารายละเอียดงานในช่อง "รายละเอียด" (requireNote)
    { id: 'other', label: 'งานอื่นๆ', price: 'ระบุรายละเอียดงาน', image: 'images/strip/graduation-47.jpg', requireNote: true,
      note: 'เช่น งานวันเกิด งานบริษัท สัมมนา ปาร์ตี้ ถ่ายครอบครัว — เล่ารายละเอียดงานในขั้นตอนที่ 04 แล้วเราจะแจ้งราคาให้',
      packages: [
      { id: 'hourly', label: 'ระบุเวลาเอง', hourly: true, maxHours: 12 },
      { id: 'fullday', label: 'เต็มวัน', ranges: [['07:00', '17:00']] },
    ] },
  ],

  // ตัวเลือก "รู้จักเราจากช่องทางไหน"
  sources: ['Facebook', 'Instagram', 'TikTok', 'Google', 'เพื่อน / คนรู้จักแนะนำ', 'เคยใช้บริการแล้ว', 'อื่นๆ'],
};

/* ---------- รีวิวจากลูกค้า ----------
   TODO: เปลี่ยนเป็นรีวิวจริง (ควรมีครบทั้ง 4 ประเภทงาน)
   category ใช้คีย์เดียวกับ CATEGORIES */
const REVIEWS = [
  {
    name: 'คุณมิ้นท์ & คุณต้น',
    category: 'wedding',
    detail: 'พิธีเช้า + งานเลี้ยง · ขอนแก่น',
    text: 'ตอนแรกกังวลมากเพราะทั้งคู่ไม่ชอบถ่ายรูปเลย แต่พี่เปรมบรีฟท่าให้ตลอด คุยเล่นจนเราหายเกร็ง ได้รูปเยอะมากและทุกรูปดูเป็นธรรมชาติ ญาติๆ ที่เห็นอัลบั้มถามหาช่างภาพกันทุกคน',
  },
  {
    name: 'น้องแพรวา',
    category: 'graduation',
    detail: 'ซ้อมใหญ่ + วันรับจริง · นครราชสีมา',
    text: 'จ้างถ่ายทั้งวันซ้อมใหญ่และวันรับจริง พี่ช่างภาพตามเก็บครบทุกช่วง ทั้งตอนออกจากหอประชุมและตอนถ่ายกับครอบครัว ภาพโทนใสสวยมาก แต่งทุกรูปแบบไม่ต้องขอเพิ่มเลย',
  },
  {
    name: 'คุณแม่ของน้องภูมิ',
    category: 'portfolio',
    detail: 'พอร์ตยื่นมหาวิทยาลัย ม.6 · บุรีรัมย์',
    text: 'ลูกเป็นคนขี้อาย ไม่มั่นใจหน้ากล้อง พี่เขาช่วยแนะนำตั้งแต่เรื่องชุด สถานที่ ไปจนถึงท่าโพส ได้รูปโปรไฟล์ที่ดูดีและเป็นตัวเองมาก เอาไปใช้ทำพอร์ตยื่นมหาวิทยาลัยได้เลย',
  },
  {
    name: 'คุณกานต์',
    category: 'event',
    detail: 'สัมมนาบริษัท · กรุงเทพฯ',
    text: 'งานสัมมนาของบริษัทมีหลายช่วงในวันเดียว ช่างภาพเก็บได้ครบทั้งบนเวที บรรยากาศ และภาพหมู่ ไม่พลาดช่วงสำคัญเลย ส่งงานไวกว่าที่นัดไว้ ทีมการตลาดเอาไปใช้ต่อได้ทันที',
  },
];
