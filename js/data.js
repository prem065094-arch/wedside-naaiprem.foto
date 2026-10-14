/* =====================================================================
   naaiprem.foto — ไฟล์ข้อมูล (แก้ไฟล์นี้ไฟล์เดียวก็พอสำหรับงานประจำวัน)
   ---------------------------------------------------------------------
   • CONTACT  : เบอร์โทร / ลิงก์โซเชียล (ทุกปุ่มในเว็บดึงจากตรงนี้)
   • SETTINGS : เปิด-ปิดเอฟเฟกต์ และจำนวนภาพที่โหลดในแกลเลอรี
   • STATS    : ตัวเลขในตัวนับ
   • GALLERY  : รายการภาพผลงาน (เพิ่ม/ลบภาพแค่แก้ Array นี้)
   • REVIEWS  : รีวิวจากลูกค้า
   ===================================================================== */

/* ---------- ข้อมูลติดต่อ ----------
   แก้ URL จริงตรงนี้ที่เดียว ปุ่ม/ลิงก์ทั้งเว็บที่มี data-contact="..." จะเปลี่ยนตามอัตโนมัติ */
const CONTACT = {
  phoneLabel: '062-234-9685',
  phone: 'tel:0622349685',
  // TODO: ใส่ URL เพจ Facebook "NAAI PREM" จริง
  facebookPage: 'https://www.facebook.com/',
  // TODO: ลิงก์ทักแชทเพจ รูปแบบ https://m.me/<ชื่อผู้ใช้ของเพจ>
  messenger: 'https://m.me/',
  // TODO: ใส่ URL Facebook ส่วนตัว "เปรม ม." จริง
  facebookPersonal: 'https://www.facebook.com/',
  instagram: 'https://www.instagram.com/naaiprem_photo/',
};

/* ---------- การตั้งค่า ---------- */
const SETTINGS = {
  grayscaleHover: false, // true = ภาพในแกลเลอรีเริ่มเป็นขาวดำเล็กน้อยแล้วเป็นสีเมื่อ hover | false = แสดงภาพสีตลอด
  initialCount: 12,     // จำนวนภาพที่แสดงครั้งแรก (ต่อหมวด)
  loadMoreCount: 12,    // จำนวนภาพที่เพิ่มเมื่อกด "ดูเพิ่มเติม" (ต่อหมวด)
  heroInterval: 6000,   // เวลาเปลี่ยนภาพ Hero (มิลลิวินาที)
  reviewInterval: 6500, // เวลาเลื่อนรีวิวอัตโนมัติ (มิลลิวินาที)
};

/* ---------- ตัวเลขในตัวนับ ----------
   TODO: เปลี่ยนเป็นตัวเลขจริง */
const STATS = [
  { value: 300, suffix: '+', label: 'งานที่ถ่ายมาแล้ว' },
  { value: 40,  suffix: '+', label: 'จังหวัดที่เคยไปถ่าย' },
  { value: 500, suffix: '+', label: 'ลูกค้าที่ไว้ใจเรา' },
];

/* ---------- ชื่อหมวดหมู่ (ใช้กับปุ่ม Filter และป้ายบนภาพ) ---------- */
const CATEGORIES = {
  wedding: 'งานแต่ง',
  graduation: 'รับปริญญา',
  portfolio: 'พอร์ตนักเรียน',
  event: 'อีเวนต์',
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
];

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
