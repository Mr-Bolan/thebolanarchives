type FooterLink = {
  href: string;
  label: string;
};

type FooterProps = {
  links?: FooterLink[];
};

export function Footer({ links = [] }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p>things built. things broken. things understood later.</p>
        {links.length > 0 ? (
          <nav aria-label="footer">
            {links.map((link) => (
              <a href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}
      </div>
    </footer>
  );
}
