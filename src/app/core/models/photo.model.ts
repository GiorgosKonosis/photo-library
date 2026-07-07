export interface Photo {
  id: string;
  author: string;
  width: number;
  height: number;
  sourceUrl: string;
  thumbnailUrl: string;
  fullUrl: string;
}

export interface PicsumPhoto {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}
