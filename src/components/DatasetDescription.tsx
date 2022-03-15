import { ITokenInfo } from "@dataxfi/datax.js";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { BsArrowLeft } from "react-icons/bs";
import ReactMarkdown from "react-markdown";
import { GlobalContext } from "../context/GlobalState";
import Loader from "./Loader";

export default function DatasetDescription({
  show,
  setShow,
  token,
}: {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  token: ITokenInfo | undefined;
}) {
  const [response, setResponse] = useState<any>();
  const [description, setDescription] = useState<string>();
  const { setSnackbarItem, ocean } = useContext(GlobalContext);
  useEffect(() => {
    if (token && show)
      try {
        axios
          .get(`https://aquarius.oceanprotocol.com/api/v1/aquarius/assets/ddo/did:op:${token.address.substring(2)}`)
          .then(setResponse);
      } catch (error) {
        console.error(error);
        setSnackbarItem({
          type: "error",
          error: { code: 0, error: error, message: "Could not retreive description for dataset." },
          message: "Could not retreive description for dataset. 1",
        });
      }
  }, [token]);

  useEffect(() => {
    console.log(response);
    if (response && show && token)
      try {
        const desc = response.data.service.find((el: any) => el.type === "metadata").attributes.additionalInformation
          .description;

        console.log(desc);
        setDescription(desc);
      } catch (error) {
        setSnackbarItem({
          type: "error",
          error: { code: 0, error: error, message: "Could not retreive description for dataset." },
          message: "Could not retreive description for dataset. 2",
        });
      }
  }, [response]);

  const prettyH3 = ({ node, props }: { node: any; props: any }) => <h3 className="text-xl mb-2" {...props}></h3>;

  return (
    <div
      className={`transition-transform transform left-0 
      ${show ? "duration-500" : "duration-200 translate-x-full"} p-2 h-109 absolute w-[384px] z-30 bg-black`}
    >
      <div className="w-full flex flex-col h-full">
        <button
          onClick={() => {
            setShow(false);
          }}
          className="px-2 rounded hover:bg-white hover:bg-opacity-25 w-10 h-10"
        >
          <BsArrowLeft className="h-6 w-6" />
        </button>

        <div className="overflow-y-scroll h-full w-full whitespace-pre-wrap">
          <h3 className="text-2xl">{token?.name}</h3>
          <h4 className="text-primary-600">{token?.symbol}</h4>
          <hr className="mb-4" />
          <h4 className="text-xl mb-2">Description</h4>
          {description ? (
            <>
              <ReactMarkdown
                components={{
                  //@ts-ignore
                  ul: ({ node, props }: { node: any; props: any }) => {
                    console.log(node.children);
                    return (
                      <ul className="my-1 flex flex-col" {...props}>
                        {node.children.value}
                      </ul>
                    );
                  },
                  //@ts-ignore
                  // li: ({ node, props }: { node: any; props: any }) => {
                  //   console.log(node.children);
                  //   return (
                  //     <li className="my-1 flex flex-col" {...props}>
                  //       {node.children.value}
                  //     </li>
                  //   );
                  // },
                  //@ts-ignore
                  h3: ({ node, props }: { node: any; props: any }) => (
                    <h3 className="text-xl my-1" {...props}>
                      {node.children[0].value}
                    </h3>
                  ),
                  //@ts-ignore
                  p: ({ node, props }: { node: any; props: any }) => (
                    <h1 className="my-1" {...props}>
                      {node.children[0].value}
                    </h1>
                  ),
                }}
              >
                {description}
              </ReactMarkdown>
            </>
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              <Loader size={48} />
            </div>
          )}
          <h4 className="my-2 text-xl">Pool Address</h4>
          <a
            href={ocean?.config.default.explorerUri + "/address/" + token?.pool}
            target="_blank"
            className="text-sm hover:text-gray-400"
          >
            {token?.pool}
          </a>
          <h4 className="my-2 text-xl">Token Address</h4>
          <a
            href={ocean?.config.default.explorerUri + "/address/" + token?.address}
            target="_blank"
            className="text-sm hover:text-gray-400"
          >
            {token?.address}
          </a>
        </div>
      </div>
    </div>
  );
}
