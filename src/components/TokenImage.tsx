import { useState } from "react";
import { BsSlashCircle } from "react-icons/bs";

export default function TokenImage({ imgSrc, className }: { imgSrc: string; className: string }) {
    const [imgFailed, setImgFailed] = useState(false);

  return (

    imgFailed ? (
        <BsSlashCircle className={className}/>
      ) : (
        <img
          src={imgSrc}
          onError={() => {
            setImgFailed(true);
          }}
          className={className}
          alt=""
          loading="lazy"
        />
      )

  )
}
