const Button = ({classes, text, onClick, disabled}: {classes: string, text: string, onClick?: React.MouseEventHandler<HTMLButtonElement>, disabled?: false | boolean}) => {
    return (
        <button onClick={onClick} disabled={disabled} className={classes  + (disabled ? ' cursor-not-allowed hover:opacity-100':'')}>
            {text}
        </button>
    )
}

export default Button
