import { ReactComponent as DataXLogo } from "../assets/datax-logo.svg";

export default function BuiltWDataX() {
  return (
    <div className="flex">
      <p className="pr-2">Built with</p>
      <a target="_blank" href="https://datax.fi" rel="noreferrer">
        <DataXLogo className="h-6" />
      </a>
    </div>
  );
}
