import { useRouter } from 'next/router'

const Lesson = () => {
  const router = useRouter()
  const { lessonid } = router.query

  return <p>Lesson: {lessonid}.</p>
}

export default Lesson;