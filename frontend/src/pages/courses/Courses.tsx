import { useQuery } from "@tanstack/react-query";
import { getAllCourses } from "../../apiFunctions/getAllCourses";
import { CoursesList } from "../../components/coursesList/CoursesList";
import { withPrivateRoute } from "../../common/withPrivateRoute/WithPrivateRoute";
import { queryKeys } from "../../config/queryKeys";

function Courses() {
  const { data: courses } = useQuery({
    queryKey: queryKeys.courses,
    queryFn: getAllCourses,
  });
  return (
    <div>
      <CoursesList courses={courses} inOffers={false} />
    </div>
  );
}

export const PrivateCourses = withPrivateRoute(Courses);
