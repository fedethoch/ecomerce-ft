import { NextResponse } from "next/server"
import { StorageService } from "@/services/storage-service"
import { CourseService } from "@/services/courses-service"
import {
  ModuleSchema,
  CourseFormDataSchema,
  ModuleFormDataSchema,
} from "@/lib/validations/CourseSchema"
import { UploadResult } from "@/types/storage/types"

// Tipos para los datos del formulario
interface ModuleFormData {
  id: string
  title: string
  topics: Array<{ name: string }>
}

interface TopicFormData {
  name: string
}

export const config = {
  api: {
    bodyParser: false,
  },
  runtime: "nodejs",
}

const storageService = new StorageService()
const coursesService = new CourseService()

export async function POST(req: Request) {
  const formData = await req.formData()

  // 1. Extraer datos del FormData
  const rawCourseData = {
    name: formData.get("name") as string,
    modality: formData.get("modality") as string,
    target_audience: formData.get("target_audience") as string,
    teacher: formData.get("teacher") as string,
    price_ars: Number(formData.get("price_ars")),
    price_usd: Number(formData.get("price_usd")),
    objectives: JSON.parse(formData.get("objectives") as string),
    start_date: new Date(formData.get("start_date") as string),
    end_date: new Date(formData.get("end_date") as string),
  }

  // Extraer datos de módulos con tipo específico
  const rawModulesData: ModuleFormData[] = JSON.parse(
    formData.get("modules") as string
  )

  // Extraer archivos
  const courseImage = formData.get("courseImage") as File
  const videos = formData.getAll("videos") as File[]
  const moduleIds = formData.getAll("moduleIds") as string[]

  // 2. Validar datos básicos del curso con Zod
  const courseValidation = CourseFormDataSchema.safeParse(rawCourseData)
  if (!courseValidation.success) {
    const fieldErrors: Record<string, string[]> = {}

    courseValidation.error.errors.forEach((error) => {
      const field = error.path.join(".")
      if (!fieldErrors[field]) {
        fieldErrors[field] = []
      }
      fieldErrors[field].push(error.message)
    })

    return NextResponse.json({
      message: "Error de validación en los datos del curso",
      fieldErrors,
      status: 400,
    })
  }

  const courseData = courseValidation.data

  // 3. Validar módulos con Zod
  for (let i = 0; i < rawModulesData.length; i++) {
    const moduleValidation = ModuleFormDataSchema.safeParse(rawModulesData[i])
    if (!moduleValidation.success) {
      const fieldErrors: Record<string, string[]> = {}

      moduleValidation.error.errors.forEach((error) => {
        const field = `modules.${i}.${error.path.join(".")}`
        if (!fieldErrors[field]) {
          fieldErrors[field] = []
        }
        fieldErrors[field].push(error.message)
      })

      return NextResponse.json({
        message: "Error de validación en los datos del módulo",
        fieldErrors,
        status: 400,
      })
    }
  }

  // 4. Validar archivos
  if (!courseImage) {
    return NextResponse.json({
      message: "La imagen del curso es requerida",
      fieldErrors: { courseImage: ["La imagen del curso es requerida"] },
      status: 400,
    })
  }

  if (videos.length === 0) {
    return NextResponse.json({
      message: "Los videos de los módulos son requeridos",
      fieldErrors: { videos: ["Los videos de los módulos son requeridos"] },
      status: 400,
    })
  }

  if (videos.length !== moduleIds.length) {
    return NextResponse.json({
      message: "Número de videos y módulos no coincide",
      fieldErrors: { videos: ["Número de videos y módulos no coincide"] },
      status: 400,
    })
  }

  // 5. Subir imagen del curso
  const courseImageUrl = await storageService.uploadImage(courseImage)

  // 6. Subir videos
  const videoUploads: UploadResult[] = await storageService.uploadVideos(
    videos,
    moduleIds
  )

  // 7. Transformar módulos al formato esperado con tipos seguros
  const modules_with_urls = rawModulesData.map((mod: ModuleFormData) => ({
    id: mod.id,
    title: mod.title,
    subtopics: mod.topics
      .map((topic: TopicFormData) => topic.name)
      .filter((name: string) => name.trim()),
    video_url:
      videoUploads.find((upload: UploadResult) => upload.moduleId === mod.id)
        ?.url || "",
  }))

  // 8. Validar módulos transformados con el schema final
  for (let i = 0; i < modules_with_urls.length; i++) {
    const parseResult = ModuleSchema.safeParse(modules_with_urls[i])
    if (!parseResult.success) {
      const fieldErrors: Record<string, string[]> = {}

      parseResult.error.errors.forEach((error) => {
        const field = `modules.${i}.${error.path.join(".")}`
        if (!fieldErrors[field]) {
          fieldErrors[field] = []
        }
        fieldErrors[field].push(error.message)
      })

      return NextResponse.json({
        message: "Error de validación final en el módulo",
        fieldErrors,
        status: 400,
      })
    }
  }

  // 9. Crear curso final
  const course = {
    ...courseData,
    image_url: courseImageUrl,
    modules: modules_with_urls,
  }

  await coursesService.createCourse(course)

  return NextResponse.json({
    message: "Curso creado exitosamente",
    status: 201,
  })
}