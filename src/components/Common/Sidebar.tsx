import { FC } from 'react';

// The Sidebar has been fully removed for Cinematic Mode.
// This file is retained as a dummy component to prevent import errors across the 20+ pages that previously used it.
// The useSidebar hook has also been neutralized to remove all margin constraints.

interface SidebarProps {
  onCloseSidebar?: () => void;
  isSidebarActive?: boolean;
}

const Sidebar: FC<SidebarProps> = () => {
  return null;
};

export default Sidebar;
