import { useEffect, useState } from "react";
import { coursesData } from "../data/coursesData";

function normalizeCourse(course, index) {
  const slug = course.slug || course.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const publishedCourse = coursesData.find((candidate) => candidate.slug === slug);
  return {
    ...publishedCourse,
    ...course,
    id: course._id || course.id || `course-${index}`,
    slug,
    title: course.title,
    category: course.category || publishedCourse?.category || "Programs",
    duration: course.duration || publishedCourse?.duration || "Flexible",
    shortDesc: course.description || course.shortDesc || publishedCourse?.shortDesc || "Explore this practical, instructor-led program at Hunar.",
    tagline: course.tagline || publishedCourse?.tagline || course.description || "Build practical, industry-ready skills at Hunar.",
    image: course.image || publishedCourse?.image || "/assets/hunar_modern_lab.jpg",
    highlights: Array.isArray(course.highlights) ? course.highlights : (publishedCourse?.highlights || course.syllabus || []),
    tools: Array.isArray(course.tools) ? course.tools : (publishedCourse?.tools || []),
    featured: course.featured ?? publishedCourse?.featured ?? false
  };
}

export default function usePublicCatalog() {
  const [courses, setCourses] = useState(coursesData);
  const [batches, setBatches] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    let active = true;

    fetch("/api/courses")
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load courses (${response.status}).`);
        return response.json();
      })
      .then((data) => {
        if (active && Array.isArray(data)) {
          setCourses(data.map(normalizeCourse).filter((course) => course.title));
        }
      })
      .catch((error) => {
        console.warn("Live course catalog could not be loaded; showing the published catalog:", error);
      })
      .finally(() => {
        if (active) setLoadingCourses(false);
      });

    fetch("/api/public/batches")
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load batch timings (${response.status}).`);
        return response.json();
      })
      .then((data) => {
        if (active && Array.isArray(data)) setBatches(data);
      })
      .catch((error) => {
        console.warn("Available batch timings could not be loaded:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return { courses, batches, loadingCourses };
}
