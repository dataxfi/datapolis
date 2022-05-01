import { FaTwitter, FaDiscord, FaMediumM, FaGithub } from 'react-icons/fa';
import { useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
export default function SocialLinkIcons({ effect }: { effect: 'grow' | 'color' }) {
  const style = `list-inline-item transition-all transform duration 200 hover:${
    effect === 'grow' ? 'scale-125' : 'text-primary-300'
  }`;
  const { location } = useContext(GlobalContext);
  return (
    <>
      {' '}
      <li className={`${style} mr-${location === '/' ? '6' : '2'}`}>
        <a href="https://twitter.com/dataxfi" target="_blank" rel="noreferrer">
          <FaTwitter />
        </a>
      </li>
      <li className={`${style} mr-${location === '/' ? '6' : '2'}`}>
        <a title="Discord" href="https://discord.com/invite/b974xHrUGV" target="_blank" rel="noreferrer">
          <FaDiscord />
        </a>
      </li>
      <li className={`${style} mr-${location === '/' ? '6' : '2'}`}>
        <a title="Medium" href="https://medium.com/datax-finance" target="_blank" rel="noreferrer">
          <FaMediumM />
        </a>
      </li>
      <li className={`${style}`}>
        <a title="GitHub" href="https://github.com/dataxfi/" target="_blank" rel="noreferrer">
          {' '}
          <FaGithub />
        </a>
      </li>
    </>
  );
}
