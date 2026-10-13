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
  grayscaleHover: true, // true = ภาพในแกลเลอรีเริ่มเป็นขาวดำเล็กน้อยแล้วเป็นสีเมื่อ hover | false = แสดงภาพสีตลอด
  initialCount: 12,     // จำนวนภาพที่แสดงครั้งแรก
  loadMoreCount: 8,     // จำนวนภาพที่เพิ่มเมื่อกด "ดูผลงานเพิ่มเติม"
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
   วิธีเพิ่มภาพ:
   1) วางไฟล์ไว้ที่ images/<หมวด>/ เช่น images/wedding/wedding-07.jpg
   2) เพิ่ม object ลงใน array ด้านล่าง
      - category : wedding | graduation | portfolio | event
      - title    : ชื่องาน (แสดงตอน hover และใน Lightbox)
      - alt      : คำอธิบายภาพภาษาไทย (บรรยายสิ่งที่เห็นในภาพจริง)
      - width / height : ขนาดจริงของไฟล์ (ดูได้ด้วย: sips -g pixelWidth -g pixelHeight ไฟล์.jpg)
   3) ลำดับใน array = ลำดับที่แสดงบนเว็บ

   ⚠️ TODO: ตอนนี้ทุกหมวดใช้ภาพพอร์ตนักเรียนเป็นตัวอย่างไปก่อน
      ให้เปลี่ยนไฟล์ในโฟลเดอร์ wedding / graduation / event เป็นภาพจริง แล้วแก้ title, alt, width, height ให้ตรง */
const GALLERY = [
  { src: 'images/wedding/wedding-01.jpg', category: 'wedding', title: 'พิธีเช้า', alt: 'กลุ่มเพื่อนยืนเรียงแถวยิ้มให้กล้องหน้าบันไดและหน้าต่างบานใหญ่', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-01-portrait.jpg', category: 'graduation', title: 'วันรับจริง', alt: 'ภาพมุมต่ำ นักเรียนจับมือกันชูขึ้นฟ้าสีครามอย่างสดใส', width: 909, height: 1363 },
  { src: 'images/portfolio/portfolio-01.jpg', category: 'portfolio', title: 'พอร์ตกลุ่ม ม.6', alt: 'นักเรียนนอนหันหัวเข้าหากันเป็นวงกลมบนสนามหญ้า ยิ้มมองกล้อง', width: 1600, height: 1065 },
  { src: 'images/event/event-01.jpg', category: 'event', title: 'ปาร์ตี้กับเพื่อน', alt: 'กลุ่มเพื่อนเกาะตาข่ายทำหน้าตลกใส่กล้อง', width: 1600, height: 1065 },

  { src: 'images/wedding/wedding-02-portrait.jpg', category: 'wedding', title: 'พรีเวดดิ้ง', alt: 'เพื่อนนอนเป็นวงกลมบนหญ้าเขียว หัวเราะอย่างเป็นธรรมชาติ', width: 909, height: 1363 },
  { src: 'images/graduation/graduation-02.jpg', category: 'graduation', title: 'ซ้อมใหญ่', alt: 'กลุ่มนักเรียนยืนเรียงแถวมองไปทางหน้าต่าง แสงธรรมชาติส่องเข้ามา', width: 1600, height: 1065 },
  { src: 'images/portfolio/portfolio-02-portrait.jpg', category: 'portfolio', title: 'โปรไฟล์ยื่นมหาลัย', alt: 'นักเรียนชายยืนข้างหน้าต่างบานใหญ่ในอาคารโทนสว่าง', width: 909, height: 1363 },
  { src: 'images/event/event-02-portrait.jpg', category: 'event', title: 'งานวันเกิด', alt: 'นักเรียนยืนคุยกันในทางเดินอาคารอย่างเป็นกันเอง', width: 909, height: 1363 },

  { src: 'images/wedding/wedding-03.jpg', category: 'wedding', title: 'งานเลี้ยงฉลอง', alt: 'ภาพมุมต่ำ กลุ่มเพื่อนจับมือชูขึ้นฟ้าพร้อมรอยยิ้ม', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-03-portrait.jpg', category: 'graduation', title: 'ถ่ายนอกรอบ', alt: 'นักเรียนหญิงยืนดื่มน้ำในทางเดินข้างราวบันได ภาพแคนดิด', width: 909, height: 1363 },
  { src: 'images/portfolio/portfolio-03.jpg', category: 'portfolio', title: 'พอร์ตกลุ่มสายสนุก', alt: 'เพื่อนนักเรียนเกาะตาข่ายโกลทำท่าทางตลก', width: 1600, height: 1065 },
  { src: 'images/event/event-03.jpg', category: 'event', title: 'งานกิจกรรมบริษัท', alt: 'คนในทีมจับมือกันชูขึ้นท้องฟ้า ถ่ายจากมุมต่ำ', width: 1600, height: 1065 },

  { src: 'images/wedding/wedding-04-portrait.jpg', category: 'wedding', title: 'พิธีหลั่งน้ำพระพุทธมนต์', alt: 'กลุ่มนักเรียนหญิงยืนเรียงแถวหน้าบันได มองไปด้านข้าง', width: 909, height: 1363 },
  { src: 'images/graduation/graduation-04.jpg', category: 'graduation', title: 'ภาพหมู่กับเพื่อน', alt: 'เพื่อนนอนเป็นวงกลมบนสนามหญ้า ภาพมุมสูงสดใส', width: 1600, height: 1065 },
  { src: 'images/portfolio/portfolio-04-portrait.jpg', category: 'portfolio', title: 'พอร์ตกลางแจ้ง', alt: 'ภาพมุมต่ำ นักเรียนหญิงชูมือขึ้นฟ้าสีฟ้าใส', width: 909, height: 1363 },
  { src: 'images/event/event-04-portrait.jpg', category: 'event', title: 'ปาร์ตี้สังสรรค์', alt: 'เพื่อนกลุ่มหนึ่งเกาะตาข่ายยิ้มและทำหน้าตลก', width: 909, height: 1363 },

  { src: 'images/wedding/wedding-05.jpg', category: 'wedding', title: 'เบื้องหลังวันงาน', alt: 'กลุ่มเพื่อนพักดื่มน้ำและพูดคุยกันในทางเดินอาคาร', width: 1600, height: 1065 },
  { src: 'images/graduation/graduation-05-portrait.jpg', category: 'graduation', title: 'ภาพเดี่ยวบัณฑิต', alt: 'กลุ่มนักเรียนหญิงยืนยิ้มเรียงแถวหน้าราวบันไดสีขาว', width: 909, height: 1363 },
  { src: 'images/portfolio/portfolio-05.jpg', category: 'portfolio', title: 'พอร์ตแคนดิด', alt: 'นักเรียนนั่งและยืนพักผ่อนในทางเดิน ภาพแคนดิดเป็นธรรมชาติ', width: 1600, height: 1065 },
  { src: 'images/event/event-05.jpg', category: 'event', title: 'สัมมนาประจำปี', alt: 'กลุ่มคนยืนเรียงแถวถ่ายภาพหมู่ในอาคารที่มีหน้าต่างบานใหญ่', width: 1600, height: 1065 },

  { src: 'images/wedding/wedding-06-portrait.jpg', category: 'wedding', title: 'มุมสนุกกับเพื่อนเจ้าสาว', alt: 'เพื่อนชายหญิงเกาะตาข่ายทำหน้าตลกใส่กล้อง', width: 909, height: 1363 },
  { src: 'images/graduation/graduation-06.jpg', category: 'graduation', title: 'แก๊งเพื่อนรัก', alt: 'กลุ่มเพื่อนเกาะตาข่ายทำหน้าตาตลกอย่างสนุกสนาน', width: 1600, height: 1065 },
  { src: 'images/portfolio/portfolio-06-portrait.jpg', category: 'portfolio', title: 'โปรไฟล์แสงธรรมชาติ', alt: 'นักเรียนชายสองคนยืนหน้าหน้าต่างบานใหญ่ แสงธรรมชาติ', width: 909, height: 1363 },
  { src: 'images/event/event-06-portrait.jpg', category: 'event', title: 'กิจกรรมกลางแจ้ง', alt: 'คนในกลุ่มนอนเป็นวงกลมบนสนามหญ้า ยิ้มมองกล้อง', width: 909, height: 1363 },
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
