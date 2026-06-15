import Link from "next/link";

type HeaderProps = {
  statusLine?: string;
};

export function Header({ statusLine = "static archive // phase 3" }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="site-brand" href="/">
          <span>thebolanarchives</span>
          <span aria-hidden="true">/</span>
          <span className="site-status">{statusLine}</span>
        </Link>
      </div>
    </header>
  );
}
