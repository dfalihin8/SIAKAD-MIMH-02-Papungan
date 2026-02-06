import { prisma } from "@/lib/prisma";

export async function createNotification(title: string, message: string, type: "INFO" | "SUCCESS" | "WARNING" | "DANGER" = "INFO") {
    try {
        return await prisma.notification.create({
            data: {
                title,
                message,
                type,
            },
        });
    } catch (error) {
        console.error("Failed to create notification:", error);
    }
}
