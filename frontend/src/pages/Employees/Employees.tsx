import { useEffect, useState } from "react";
import { getEmployees } from "../../services/employeeService";

function Employees() {
    const [employees, setEmployees] = useState<any[]>([]);

    useEffect(() => {
        getEmployees().then((data) => setEmployees(data));
    }, []);

    return (
        <div>
            <h1>Employees</h1>

            <table border={1} cellPadding={10}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Department</th>
                    </tr>
                </thead>

                <tbody>
                    {employees.map((emp) => (
                        <tr key={emp.id}>
                            <td>{emp.id}</td>
                            <td>{emp.firstName}</td>
                            <td>{emp.lastName}</td>
                            <td>{emp.email}</td>
                            <td>{emp.department}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Employees;