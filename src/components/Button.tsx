import { IBtnProps } from '../@types/types';
const Button = ({ classes, text, onClick, disabled, id }: IBtnProps) => {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      className={classes + (disabled ? ' cursor-not-allowed hover:opacity-100' : '')}
    >
      {text}
    </button>
  );
};

export default Button;
