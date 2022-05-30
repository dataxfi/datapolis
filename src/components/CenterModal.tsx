import OutsideClickHandler from 'react-outside-click-handler';

type Props = {
  className: string;
  onOutsideClick: Function;
  id: string;
  children?: JSX.Element;
};

export default function CenterModal(props: Props) {
  return (
    <div className={`fixed center ${props.className}`} id={props.id}>
      <OutsideClickHandler onOutsideClick={() => props.onOutsideClick()}>{props.children}</OutsideClickHandler>
    </div>
  );
}
