import axios from "axios";
import { useContext, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GlobalContext } from "../context/GlobalState";
import Loader from "./Loader";
//@ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
//@ts-ignore
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import style from "../markdown.module.css";
import { BsBoxArrowUpRight } from "react-icons/bs";
export default function DatasetDescription({}: {}) {
  const [response, setResponse] = useState<any>();
  const [description, setDescription] = useState<string>();
  const [name, setName] = useState<string>();
  const [dateCreated, setDateCreate] = useState<string>();
  const [author, setAuthor] = useState<string>();
  const [did, setDID] = useState<string>();
  const { setSnackbarItem, ocean, token2 } = useContext(GlobalContext);

  useEffect(() => {
    if (token2.info)
      try {
        axios
          .get(
            `https://aquarius.oceanprotocol.com/api/v1/aquarius/assets/ddo/did:op:${token2.info.address.substring(2)}`
          )
          .then(setResponse);
      } catch (error) {
        console.error(error);
        setSnackbarItem({
          type: "error",
          error: { code: 0, error: error, message: "Could not retreive description for dataset." },
          message: "Could not retreive description for dataset. 1",
        });
      }
  }, [token2.info]);

  useEffect(() => {
    try {
      setDID(response.data.id);
      const metadata = response.data.service.find((el: any) => el.type === "metadata");
      setName(metadata.attributes.main.name);
      setAuthor(metadata.attributes.main.author);
      setDateCreate(metadata.attributes.main.dateCreated);
      const desc = metadata.attributes.additionalInformation.description;
      setDescription(desc);
    } catch (error) {
      setSnackbarItem({
        type: "error",
        error: { code: 0, error: error, message: "Could not retreive description for dataset." },
        message: "Could not retreive description for dataset. 2",
      });
    }
  }, [response]);

  return (
    <div className={`absolute top-1/2 -translate-y-1/2 w-1/3 items-center -left-1/3 transition-transform transform duration-500 ${token2.info? "translate-x-[150%]" : ""}`}>
      <div className="flex flex-col max-h-[750px] bg-black bg-opacity-90 rounded-lg p-4">
        <div className="overflow-y-scroll h-1/4 hm-hide-scrollbar w-full whitespace-pre-wrap">
          {name ? (
            <>
              <div className="flex justify-between ">
                <h3 className="text-blue-300 text-2xl">{name}</h3>
              </div>
              <div className="my-2 bg-gray-500 h-1px w-full" />
            </>
          ) : (
            <></>
          )}
          {token2.info ? (
            <>
              <div className="flex justify-between">
                <div>
                  <h3 className="text-blue-300 text-xl">{token2.info?.name}</h3>
                  <h4 className="text-primary-600">{token2.info?.symbol}</h4>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center w-full justify-end">
                    <a
                      href={ocean?.config.default.explorerUri + "/address/" + token2.info?.pool}
                      target="_blank"
                      className="text-xl hover:text-gray-400 flex items-center mr-4"
                    >
                      Pool <BsBoxArrowUpRight className="text-base" />
                    </a>
                    <a
                      href={ocean?.config.default.explorerUri + "/address/" + token2.info?.address}
                      target="_blank"
                      className="text-xl hover:text-gray-400 flex items-center"
                    >
                      Token <BsBoxArrowUpRight className="text-base" />{" "}
                    </a>
                  </div>
                  {dateCreated ? <p className="text-gray-600">Created: {dateCreated}</p> : <></>}
                </div>
              </div>
              <div className="my-2 bg-gray-500 h-1px w-full" />
            </>
          ) : (
            <></>
          )}
          <h4 className="text-blue-300  text-xl mb-2">Description</h4>
          {description ? (
            <>
              <ReactMarkdown
                className={style.reactMarkDown}
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        children={String(children).replace(/\n$/, "")}
                        style={atomDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
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

          {token2.info ? (
            <>
              {author ? (
                <p className="text-blue-300 test-sm">
                  Author: <span className="text-white">{author}</span>{" "}
                </p>
              ) : (
                <></>
              )}{" "}
              <p className="text-blue-300 test-sm">
                DID: {"\t"}
                <span className="text-sm text-white">{did ? did : ""}</span>
              </p>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}
