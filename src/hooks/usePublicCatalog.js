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
    badge: course.badge || publishedCourse?.badge || "",
    mode: course.mode || publishedCourse?.mode || "Offline Lab + Hands-on",
    level: course.level || publishedCourse?.level || "",
    shortDesc: course.shortDesc || course.description || publishedCourse?.shortDesc || "Explore this practical, instructor-led program at Hunar.",
    tagline: course.tagline || publishedCourse?.tagline || course.description || "Build practical, industry-ready skills at Hunar.",
    image: course.image || publishedCourse?.image || "/assets/hunar_modern_lab.jpg",
    highlights: Array.isArray(course.highlights) ? course.highlights : (publishedCourse?.highlights || course.syllabus || []),
    tools: Array.isArray(course.tools) ? course.tools : (publishedCourse?.tools || []),
    syllabus: Array.isArray(course.syllabus) && course.syllabus.length ? course.syllabus : (publishedCourse?.syllabus || []),
    curriculum: Array.isArray(course.curriculum) && course.curriculum.length ? course.curriculum : (publishedCourse?.curriculum || []),
    projects: Array.isArray(course.projects) && course.projects.length ? course.projects : (publishedCourse?.projects || []),
    careerRoles: Array.isArray(course.careerRoles) && course.careerRoles.length ? course.careerRoles : (publishedCourse?.careerRoles || []),
    mentor: course.mentor?.name ? course.mentor : (publishedCourse?.mentor || course.mentor || null),
    rating: course.rating ?? publishedCourse?.rating ?? 0,
    reviewsCount: course.reviewsCount ?? publishedCourse?.reviewsCount ?? 0,
    featured: course.featured ?? publishedCourse?.featured ?? false
  };
}

function mergePublishedCourses(liveCourses) {
  const coursesBySlug = new Map(
    coursesData.map((course, index) => [course.slug, normalizeCourse(course, index)])
  );
  liveCourses.forEach((course, index) => {
    const normalizedCourse = normalizeCourse(course, coursesData.length + index);
    if (!normalizedCourse.title) return;
    coursesBySlug.set(normalizedCourse.slug, {
      ...coursesBySlug.get(normalizedCourse.slug),
      ...normalizedCourse
    });
  });
  return Array.from(coursesBySlug.values());
}

// Module-level cache — one fetch per session, shared across all hook instances
const _cache = { courses: null, batches: null, coursesPromise: null, batchesPromise: null };

function fetchCourses() {
  if (_cache.coursesPromise) return _cache.coursesPromise;
  _cache.coursesPromise = fetch("/api/courses")
    .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
    .then((data) => { if (Array.isArray(data)) { _cache.courses = mergePublishedCourses(data); } return _cache.courses; })
    .catch((err) => { console.warn("Live course catalog unavailable, using published:", err.message); _cache.coursesPromise = null; return null; });
  return _cache.coursesPromise;
}

function fetchBatches() {
  if (_cache.batchesPromise) return _cache.batchesPromise;
  _cache.batchesPromise = fetch("/api/public/batches")
    .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
    .then((data) => { if (Array.isArray(data)) { _cache.batches = data; } return _cache.batches; })
    .catch((err) => { console.warn("Batch timings unavailable:", err.message); _cache.batchesPromise = null; return null; });
  return _cache.batchesPromise;
}

export default function usePublicCatalog() {
  const [courses, setCourses] = useState(_cache.courses || coursesData);
  const [batches, setBatches] = useState(_cache.batches || []);
  const [loadingCourses, setLoadingCourses] = useState(!_cache.courses);

  useEffect(() => {
    let active = true;
    fetchCourses().then((result) => {
      if (active && result) { setCourses(result); }
      if (active) setLoadingCourses(false);
    });
    fetchBatches().then((result) => {
      if (active && result) setBatches(result);
    });
    return () => { active = false; };
  }, []);

  return { courses, batches, loadingCourses };
}
