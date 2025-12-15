export class Task{
    id: string = "";
    title: string="";
    description: string="";
    status: string = "Pending"; // Pending, Completed (backend enum)
    priority: string = "Medium"; // Low, Medium, High (backend enum)
    isEditMode: boolean = false;
    dueDate: Date = new Date();
    
    constructor(
        id: string, 
        title:string, 
        description:string, 
        status:string, 
        dueDate:Date,
        priority: string = "Medium"
    ){
        this.id = id;
        this.description = description;
        this.title = title;
        this.status = status;
        this.dueDate = dueDate;
        this.priority = priority;
    }

    // Convert to API request format (for sending to server)
    toApiRequest(): object {
        return {
            title: this.title,
            description: this.description,
            status: this.status,
            priority: this.priority,
            dueDate: this.dueDate
        };
    }

    // Create Task from API response
    static fromApiResponse(data: any): Task {
        return new Task(
            data._id || data.id || "",
            data.title || "",
            data.description || "",
            data.status || "Pending",
            data.dueDate ? new Date(data.dueDate) : new Date(),
            data.priority || "Medium"
        );
    }
}