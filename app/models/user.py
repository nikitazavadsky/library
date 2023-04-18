from enum import IntEnum, auto

from pydantic import BaseModel, EmailStr, Field


class UserRole(IntEnum):
    READER = auto()  # 1
    LIBRARIAN = auto()
    ADMIN = auto()


class UserCreateModel(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str | None = None
    password: str = Field(..., min_length=8)


class UserLoginModel(BaseModel):
    email: str
    password: str


class UserIdModel(BaseModel):
    user_id: int


class UserResponseModel(BaseModel):
    email: str
    first_name: str
    last_name: str | None


class UserResponseModelExtended(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str | None
    role: UserRole

    @property
    def is_reader(self):
        return self.role == UserRole.READER

    @property
    def is_librarian(self):
        return self.role == UserRole.LIBRARIAN

    @property
    def is_admin(self):
        return self.role == UserRole.ADMIN

    class Config:
        json_encoders = {UserRole: lambda user_role: user_role.name}
