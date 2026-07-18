import { useAppSelector, useAppDispatch } from "../store/hooks";
import { toggleSidebar, setSidebarVisible } from "../store/slice/uiSlice";
import { useCurrentViewportView } from "./useCurrentViewportView";

export const useSidebar = () => {
  const dispatch = useAppDispatch();
  const { isMobile } = useCurrentViewportView();

  // Sidebar is fully removed — always false
  const isSidebarVisible = false;

  const toggle = () => {};
  const setVisible = (_visible: boolean) => {};

  const marginClass = "md:ml-0";
  const widthClass = "md:w-full";

  return {
    isSidebarVisible,
    toggle,
    setVisible,
    marginClass,
    widthClass,
    isMobile
  };
};
