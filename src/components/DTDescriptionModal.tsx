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
import { BsArrowLeft, BsArrowRight, BsBoxArrowUpRight } from "react-icons/bs";
import axios from "axios";
import { IToken } from "@dataxfi/datax.js";
export default function DatasetDescription() {
  const [description, setDescription] = useState<string>();
  const [name, setName] = useState<string>();
  const [dateCreated, setDateCreate] = useState<string>();
  const [author, setAuthor] = useState<string>();
  const [did, setDID] = useState<string>();
  const { setSnackbarItem, ocean, token2, showDescModal, setShowDescModal, t2DIDResponse, setT2DIDResponse, location } = useContext(GlobalContext);

  useEffect(() => {
    if (showDescModal && !t2DIDResponse) {
      getDID(setT2DIDResponse, token2);
    }
  }, [showDescModal]);

  useEffect(() => {
    try {
      if (token2.info?.address) {
        getDID(setT2DIDResponse, token2);
      } else {
        setT2DIDResponse(undefined);
      }
    } catch (error) {
      console.error(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token2.info?.address, location]);

  useEffect(() => {
    if (t2DIDResponse)
      try {
        setDID(t2DIDResponse.data.id);
        const metadata = t2DIDResponse.data.service.find((el: any) => el.type === "metadata").attributes;
        setName(metadata.main.name);
        setAuthor(metadata.main.author);
        setDateCreate(metadata.main.dateCreated);
        const desc = metadata.additionalInformation.description;
        setDescription(desc);
      } catch (error) {
        setSnackbarItem({
          type: "error",
          error: { code: 0, error: error, message: "Could not retreive description for dataset." },
          message: "Could not set metadata for dataset.",
        });
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t2DIDResponse, token2.info]);


  return (
    <div
      id={`${showDescModal && t2DIDResponse && token2.info ? "dataset-desc-vis" : "dataset-desc-invis"}`}
      className={`absolute max-w-[550px] top-1/2 left-1/2 ${
        showDescModal && t2DIDResponse && token2.info ? "-translate-x-1/2 2lg:-translate-x-full" : "translate-x-[-225%] 2lg:translate-x-[-260%] 3xl:translate-x-[-400%]"
      } -translate-y-1/2 items-center w-full transition-transform transform duration-500 px-2`}
    >
      <div className="flex flex-col max-h-[750px] bg-black bg-opacity-90 rounded-lg p-4">
        {description ? (
          <>
            <div className="flex justify-between">
              <button
                id="datasetBackBtn"
                onClick={() => {
                  setShowDescModal(false);
                }}
                className="w-6 h-6 pl-1 invisible 2lg:visible hover:bg-white hover:bg-opacity-25 rounded"
              >
                <BsArrowLeft />
              </button>
              <button
                id="datasetBackBtn"
                onClick={() => {
                  setShowDescModal(false);
                }}
                className="w-6 h-6 pl-1 visibile 2lg:invisible hover:bg-white hover:bg-opacity-25 rounded"
              >
                <BsArrowRight />
              </button>
            </div>

            <div className="overflow-y-scroll h-full hm-hide-scrollbar w-full whitespace-pre-wrap">
              {name ? (
                <>
                  <div className="flex justify-between ">
                    <h3 className="text-blue-300 text-lg md:text-2xl">{name}</h3>
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
                      <h3 className="text-blue-300 md:text-xl text-sm">{token2.info?.name}</h3>
                      <h4 className="text-primary-600 text-sm">{token2.info?.symbol}</h4>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center w-full justify-end text-sm md:text-base">
                        <a
                          rel="noreferrer"
                          href={ocean?.config.default.explorerUri + "/address/" + token2.info?.pool}
                          target="_blank"
                          className="hover:text-gray-400 flex items-center mr-4"
                        >
                          Pool <BsBoxArrowUpRight className="text-xs md:text-sm" />
                        </a>
                        <a
                          rel="noreferrer"
                          href={ocean?.config.default.explorerUri + "/address/" + token2.info?.address}
                          target="_blank"
                          className="hover:text-gray-400 flex items-center"
                        >
                          Token <BsBoxArrowUpRight className="text-xs md:text-sm" />{" "}
                        </a>
                      </div>
                      {dateCreated ? <p className="text-xs md:text-base text-gray-600 text-right">Created: {dateCreated}</p> : <></>}
                    </div>
                  </div>
                  <div className="my-2 bg-gray-500 h-1px w-full" />
                </>
              ) : (
                <></>
              )}
              {description ? (
                <>
                  <h4 className="text-blue-300  text-base md:text-xl mb-2">Description</h4>
                  <ReactMarkdown
                    className={style.reactMarkDown}
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <SyntaxHighlighter children={String(children).replace(/\n$/, "")} style={atomDark} language={match[1]} PreTag="div" {...props} />
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
                <></>
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
                    <span className="text-xs md:text-sm text-white">{did ? did : ""}</span>
                  </p>
                </>
              ) : (
                <></>
              )}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <Loader size={48} />
          </div>
        )}
      </div>
    </div>
  );
}

export async function getDID(setT2DIDResponse: React.Dispatch<any>, token2: IToken) {
  axios
    .get(`https://aquarius.oceanprotocol.com/api/v1/aquarius/assets/ddo/did:op:${token2.info?.address.substring(2)}`)
    .then(setT2DIDResponse)
    .catch(console.error);
}
