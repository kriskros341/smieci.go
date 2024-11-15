package repositories

import (
	"backend/models"
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
)

type UsersRepository interface {
	GetAll() ([]models.User, error)
	GetUserById(userId string) (*models.User, error)
	GetPermissionsByUserId(userId string) ([]string, error)
	GetParticipantsBySolutionId(solutionId string) ([]models.Participant, error)
}

type usersRepository struct {
	db *sqlx.DB
}

func NewUsersRepository(db *sqlx.DB) UsersRepository {
	return &usersRepository{db: db}
}

func (r *usersRepository) GetAll() ([]models.User, error) {
	var users []models.User

	err := r.db.Select(&users, "SELECT id, username, points, profileImageURL FROM users")
	if err != nil {
		return nil, err
	}

	return users, nil
}

func (r *usersRepository) GetUserById(userId string) (*models.User, error) {
	var user models.User

	query := "SELECT id, username, points FROM users WHERE id = $1"
	fmt.Println("Executing query:", query, "with userId:", userId)
	err := r.db.Get(&user, query, userId)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *usersRepository) GetPermissionsByUserId(userId string) ([]string, error) {
	var permissions []string
	query := fmt.Sprintf("SELECT p.pname FROM permissions p JOIN users_permissions_relation upr on p.id = upr.permissionId where upr.userId = '%s'", userId)
	err := r.db.Select(&permissions, query)
	if err != nil {
		return nil, err
	}

	return permissions, nil
}

func (r *usersRepository) GetParticipantsBySolutionId(solutionId string) ([]models.Participant, error) {
	var participants []models.Participant
	query := fmt.Sprintf(`
select users.id FROM solutions_users_relation susr
join users on susr.userid = users.id
WHERE susr.solutionid = %s;
		`, solutionId)
	fmt.Printf("executing query: %s", query)
	err := r.db.Select(&participants, query)
	if err != nil {
		log.Fatalln("Error executing query:", err.Error())
		return nil, err
	}

	return participants, nil
}
