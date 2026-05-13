import { AdminList } from "./admins-component";
import { HeadingComponent } from "./heading-component";

export default async function AccessManager() {   
    
    return <div className="container h-[calc(100vh-80px)]">
        <HeadingComponent />
        <AdminList id={"1"}/>
    </div>
}