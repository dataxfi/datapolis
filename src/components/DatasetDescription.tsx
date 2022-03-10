export default function DatasetDescription({
  show,
  setShow,
}: {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div
      id="descModal"
      className={`fixed top-1/2 left-1/2 transform -translate-y-1/2 ${show? "translate-x-full" : "-translate-x-1/2"}  z-20 w-full sm:max-w-sm transition-transform duration-500 h-full`}
    >
      <div className="p-2 bg-background border-primary-500 border rounded-lg hm-box mx-3 max-h-109 overflow-hidden"></div>
    </div>
  );
}
