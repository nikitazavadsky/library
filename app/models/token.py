from pydantic import BaseModel


class TokenUpdateModel(BaseModel):
    refresh: str


class TokenObtainPair(TokenUpdateModel):
    access: str
