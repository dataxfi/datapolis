const Button = ({classes, text, onClick, disabled}: {classes: string, text: string, onClick?: React.MouseEventHandler<HTMLButtonElement>, disabled?: false | boolean}) => {
    return (
        <button onClick={onClick} className={classes} disabled={disabled}>
            {text}
        </button>
    )
}

export default Button
