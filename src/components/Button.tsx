interface IBtnProps {
    classes: string,
    text: string,
    onClick?: React.MouseEventHandler<HTMLButtonElement>,
    disabled?: boolean,
}

const Button = ({classes, text, onClick, disabled}: IBtnProps) => {
    return (
        <button onClick={onClick} disabled={disabled} className={classes  + (disabled ? ' cursor-not-allowed hover:opacity-100':'')}>
            {text}
        </button>
    )
}

export default Button;
export type {IBtnProps};
