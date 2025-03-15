const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer footer-center bg-base-200 p-4 text-base-content">
      <div>
        <p>© {currentYear} 广告位管理平台 - 版权所有</p>
      </div>
    </footer>
  );
};

export default Footer;
