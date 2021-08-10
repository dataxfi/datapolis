const Button = ({classes, text, onClick}: {classes: string, text: string, onClick?: React.MouseEventHandler<HTMLButtonElement>}) => {
    return (
        <button onClick={onClick} className={classes}>
            {text}
        </button>
    )
}

export default Button
