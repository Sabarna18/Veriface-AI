import json

def generate_json(classroom_id , users_no):
    users = []

    for i in range(1, users_no+1):
        
        users.append({"user_id": f"{classroom_id}_{i:03d}"})

    data = {
        "classroom_id": classroom_id,
        "users": users
    }

    with open("users.json", "w") as f:
        json.dump(data, f, indent=2)

    print("users.json generated")
    
def main():
    classroom_id = input("Enter classroom id: ")
    users_no = int(input("Enter no. of users to register: "))
    generate_json(classroom_id=classroom_id , users_no=users_no)

if __name__ == "__main__":
    main()