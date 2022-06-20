import { useContext, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GlobalContext } from '../context/GlobalState';
import Loader from './Loader';
// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import style from '../markdown.module.css';
import { BsArrowLeft, BsArrowRight, BsBoxArrowUpRight } from 'react-icons/bs';
import axios from 'axios';
export default function DatasetDescription() {
  const [description, setDescription] = useState<string>();
  const [name, setName] = useState<string>();
  const [dateCreated, setDateCreate] = useState<string>();
  const [author, setAuthor] = useState<string>();
  const [did, setDID] = useState<string>();
  const {
    setSnackbarItem,
    tokenOut,
    showDescModal,
    setShowDescModal,
    t2DIDResponse,
    setT2DIDResponse,
    location,
    config
  } = useContext(GlobalContext);

  useEffect(() => {
    if (showDescModal && !t2DIDResponse && tokenOut.info?.did) {
      getDID(setT2DIDResponse, tokenOut.info?.did);
    }
  }, [showDescModal]);

  useEffect(() => {
    try {
      if (tokenOut.info?.pool) {
        console.log(tokenOut);
        getDID(setT2DIDResponse, tokenOut.info.did);
        setDID(tokenOut.info.did);
      } else {
        setT2DIDResponse(undefined);
      }
    } catch (error) {
      console.error(error);
    }
  }, [tokenOut.info?.address, location]);

  useEffect(() => {
    if (t2DIDResponse) {
      console.log(t2DIDResponse);

      try {
        const metadata = t2DIDResponse.data.metadata;
        setName(metadata.name);
        setAuthor(metadata.author);
        setDateCreate(metadata.created);
        const desc = metadata.description;
        setDescription(desc);
      } catch (error) {
        console.error(error);
        setSnackbarItem({
          type: 'error',
          error: { code: 0, error, message: 'Could not retreive description for dataset.' },
          message: 'Could not set metadata for dataset.',
        });
      }
    }
  }, [t2DIDResponse, tokenOut.info]);

  return (
    <div
      id={`${showDescModal && t2DIDResponse && tokenOut.info ? 'dataset-desc-vis' : 'dataset-desc-invis'}`}
      className={`absolute max-w-[550px] top-1/2 left-1/2 ${
        showDescModal && t2DIDResponse && tokenOut.info ? '-translate-x-1/2 2lg:-translate-x-full' : 'translate-x-[-225%] 2lg:translate-x-[-260%] 3xl:translate-x-[-400%]'
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
              {tokenOut.info ? (
                <>
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-blue-300 md:text-xl text-sm">{tokenOut.info?.name}</h3>
                      <h4 className="text-primary-600 text-sm">{tokenOut.info?.symbol}</h4>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center w-full justify-end text-sm md:text-base">
                        <a
                          rel="noreferrer"
                          href={config?.default.explorerUri + '/address/' + tokenOut.info?.pool}
                          target="_blank"
                          className="hover:text-gray-400 flex items-center mr-4"
                        >
                          Pool <BsBoxArrowUpRight className="text-xs md:text-sm" />
                        </a>
                        <a
                          rel="noreferrer"
                          href={config?.default.explorerUri + '/address/' + tokenOut.info?.address}
                          target="_blank"
                          className="hover:text-gray-400 flex items-center"
                        >
                          Token <BsBoxArrowUpRight className="text-xs md:text-sm" />{' '}
                        </a>
                      </div>
                      {dateCreated ? (
                        <p className="text-xs md:text-base text-gray-600 text-right">Created: {dateCreated}</p>
                      ) : (
                        <></>
                      )}
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
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter style={atomDark} language={match[1]} PreTag="div" {...props}>
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
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

              {tokenOut.info ? (
                <>
                  {author ? (
                    <p className="text-blue-300 test-sm">
                      Author: <span className="text-white">{author}</span>{' '}
                    </p>
                  ) : (
                    <></>
                  )}{' '}
                  <p className="text-blue-300 test-sm">
                    DID: {'\t'}
                    <span className="text-xs md:text-sm text-white w-min">{did || ''}</span>
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

export async function getDID(setT2DIDResponse: React.Dispatch<any>, did: string) {
  axios
    .get(`https://v4.aquarius.oceanprotocol.com/api/aquarius/assets/ddo/${did}`)
    .then(setT2DIDResponse)
    .catch(console.error);
}
