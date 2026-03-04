// Netflix and MovieBox.ph inspired features
import { FC, useState, useEffect } from 'react';
import { BsPlayFill, BsInfoCircle, BsVolumeMute, BsVolumeUp } from 'react-icons/bs';
import { MdAdd, MdCheck, MdThumbUp, MdThumbDown } from 'react-icons/md';
import { Item } from '../../shared/types';

interface NetflixFeaturesProps {
  item: Item;
  onPlay?: () => void;
  onAddToList?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
}

/**
 * Netflix-style feature buttons and interactions
 * Includes: Play, Add to List, Like/Dislike, Info
 */
export const NetflixFeatureButtons: FC<NetflixFeaturesProps> = ({
  item,
  onPlay,
  onAddToList,
  onLike,
  onDislike,
}) => {
  const [isInList, setIsInList] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  // Check if item is in user's list
  useEffect(() => {
    // Check localStorage or Firestore for user's list
    const userList = JSON.parse(localStorage.getItem('userList') || '[]');
    setIsInList(userList.some((i: Item) => i.id === item.id));
  }, [item.id]);

  const handleAddToList = () => {
    const userList = JSON.parse(localStorage.getItem('userList') || '[]');
    if (isInList) {
      const newList = userList.filter((i: Item) => i.id !== item.id);
      localStorage.setItem('userList', JSON.stringify(newList));
      setIsInList(false);
    } else {
      userList.push(item);
      localStorage.setItem('userList', JSON.stringify(userList));
      setIsInList(true);
    }
    onAddToList?.();
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
    onLike?.();
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
    onDislike?.();
  };

  return (
    <div className="flex items-center gap-3">
      {/* Play Button - Netflix style */}
      <button
        onClick={onPlay}
        className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded hover:bg-gray-200 transition-colors font-semibold"
      >
        <BsPlayFill size={20} />
        <span>Play</span>
      </button>

      {/* Add to List - MovieBox style */}
      <button
        onClick={handleAddToList}
        className="w-10 h-10 rounded-full border-2 border-white/70 hover:border-white flex items-center justify-center transition-colors"
        title={isInList ? 'Remove from My List' : 'Add to My List'}
      >
        {isInList ? <MdCheck size={24} /> : <MdAdd size={24} />}
      </button>

      {/* Like/Dislike - Netflix style */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleLike}
          className={`w-10 h-10 rounded-full border-2 border-white/70 hover:border-white flex items-center justify-center transition-colors ${
            isLiked ? 'bg-white/20 border-white' : ''
          }`}
          title="I like this"
        >
          <MdThumbUp size={20} />
        </button>
        <button
          onClick={handleDislike}
          className={`w-10 h-10 rounded-full border-2 border-white/70 hover:border-white flex items-center justify-center transition-colors ${
            isDisliked ? 'bg-white/20 border-white' : ''
          }`}
          title="Not for me"
        >
          <MdThumbDown size={20} />
        </button>
      </div>

      {/* Info Button */}
      <button
        onClick={() => window.location.href = `/${item.media_type}/${item.id}`}
        className="w-10 h-10 rounded-full border-2 border-white/70 hover:border-white flex items-center justify-center transition-colors"
        title="More Info"
      >
        <BsInfoCircle size={20} />
      </button>
    </div>
  );
};

/**
 * Auto-play preview with mute toggle (Netflix style)
 */
export const AutoPlayPreview: FC<{
  videoUrl: string;
  isPlaying: boolean;
  onToggleMute: () => void;
  isMuted: boolean;
}> = ({ videoUrl, isPlaying, onToggleMute, isMuted }) => {
  if (!isPlaying) return null;

  return (
    <div className="relative w-full h-full">
      <video
        src={videoUrl}
        autoPlay
        loop
        muted={isMuted}
        className="w-full h-full object-cover"
        playsInline
      />
      <button
        onClick={onToggleMute}
        className="absolute bottom-4 right-4 w-10 h-10 rounded-full border-2 border-white bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <BsVolumeMute size={20} /> : <BsVolumeUp size={20} />}
      </button>
    </div>
  );
};

/**
 * Continue Watching section (Netflix style)
 */
export const ContinueWatchingCard: FC<{
  item: Item;
  progress: number; // 0-100
  onResume: () => void;
}> = ({ item, progress, onResume }) => {
  return (
    <div className="relative group cursor-pointer" onClick={onResume}>
      <div className="relative">
        <img
          src={item.poster_path || item.backdrop_path}
          alt={item.title || item.name}
          className="w-full h-auto rounded"
        />
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
          <BsPlayFill size={40} className="text-white" />
        </div>
      </div>
      <p className="mt-2 text-sm text-white truncate">{item.title || item.name}</p>
    </div>
  );
};
