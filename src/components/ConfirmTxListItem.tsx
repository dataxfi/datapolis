export default function ConfirmTxListItem({
  name,
  value,
  valueClass,
}: {
  name: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div id={`swapListItem-${name}`} className="flex justify-between mt-2">
      <div>
        <p className="text-gray-300 text-sm">{name}</p>
      </div>
      <div>
        <p id={`swapListValue-${name}`} className={'text-sm ' + (valueClass || 'text-gray-100')}>
          {value}
        </p>
      </div>
    </div>
  );
}
