package errors

import "fmt"

type AppError struct {
	Code    string
	Message string
	Err     error
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("[%s] %s: %v", e.Code, e.Message, e.Err)
	}
	return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

func NewAppError(code, message string, err error) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
		Err:     err,
	}
}

// Common error constructors
func NotFound(message string) *AppError {
	return NewAppError("NOT_FOUND", message, nil)
}

func BadRequest(message string) *AppError {
	return NewAppError("BAD_REQUEST", message, nil)
}

func Unauthorized(message string) *AppError {
	return NewAppError("UNAUTHORIZED", message, nil)
}

func InternalError(err error) *AppError {
	return NewAppError("INTERNAL_ERROR", "An internal error occurred", err)
}
