import { News } from "../../models/News";
import "./NewsBox.scss";

interface NewsProps {
  news: News[];
}

export const NewsBox = ({ news }: NewsProps) => {
  return (
    <div className="newsBox">
      {news.map((info, index) => (
        <div className="newsTile" key={index}>
          <div className="newsTitle">
            <div>
              <b>{info.title}</b>
            </div>
            <div>{info.date}</div>
          </div>
          <div className="newsContent">{info.content}</div>
          <hr />
        </div>
      ))}
    </div>
  );
};
