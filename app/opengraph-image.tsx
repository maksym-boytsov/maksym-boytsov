import { SHARE_SIZE, shareImage } from "@/lib/share/image";

export const alt = "Maksym Boytsov, Head of Engineering at ChainPatrol, next to one of the drawings maksym.page makes for each visitor.";
export const size = SHARE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return shareImage();
}
