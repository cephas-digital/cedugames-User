import {Navigate,useLocation} from "react-router-dom";

// Backward-compatible redirect: level selection now lives on the illustrated game map.
export default function LevelSelection(){
 const location=useLocation();
 return <Navigate to={`/play${location.search}`} replace/>;
}
