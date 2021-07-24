const Button = ({classes, text}: {classes: string, text: string}) => {
    return (
        <button className={classes}>
            {text}
        </button>
    )
}

export default Button
