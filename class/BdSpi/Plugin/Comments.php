<?php
namespace BdSpi\Plugin;
 
/**
 * Permet de mettre en place un système de commentaire (récupération et sauvegarde pour n'importe quel contenu)
 */
class Comments{
 
    private $pdo;
    private $default = array(
        'username_error' => "Vous n'avez pas rentré de pseudo",
        'email_error' => "Votre email n'est pas valide",
        'content_error' => "Vous n'avez pas mis de message",
        'parent_error' => "Vous essazer de répondre à un commentaire qui n'existe pas"
    );
    public $errors = array();
    public $count  = 0;
 
    /**
     * Permet d'initialiser le module commentaire
     * @param PDO $pdo instance d'une connection mysql via pdo
     * @param array $options
     */
    public function __construct($pdo, $options = []) {
        $this->pdo = $pdo;
        $this->options = array_merge($this->default, $options);
    }
 
    /**
     * Permet de récupérer les derniers commentaires d'un sujet
     * @param  string $ref
     * @param  integer $ref_id
     * @return array
     */
    public function findAll($ref, $ref_id) {
        $q = $this->pdo->prepare("
            SELECT *
            FROM comments
            WHERE ref_id = :ref_id
                AND ref = :ref
            ORDER BY created DESC");
        $q->execute(['ref' => $ref, 'ref_id' => $ref_id]);
        $comments = $q->fetchAll();
        $this->count = count($comments);
 
        // Filtrage des réponses
        $replies  = [];
        foreach($comments as $k => $comment){
            if ($comment->parent_id){
                $replies[$comment->parent_id][] = $comment;
                unset($comments[$k]);
            }
        }
        foreach($comments as $k => $comment){
            if (isset($replies[$comment->id])) {
                $comments[$k]->replies = array_reverse($replies[$comment->id]);
            }else{
                $comments[$k]->replies = [];
            }
        }
        return $comments;
    }
 
    /**
     * Permet de sauvegarder un commentaire
     * @param  string $ref
     * @param  integer $ref_id
     * @return boolean
     */
    public function save($ref, $ref_id) {
        $errors = [];
        if (empty($_POST['username'])) {
            $errors['username'] = $this->options['username_error'];
        }
        if (
            empty($_POST['email']) ||
            !filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = $this->options['email_error'];
        }
        if (empty($_POST['content'])) {
            $errors['content'] = $this->options['content_error'];
        }
        if (count($errors) > 0) {
            $this->errors = $errors;
            return false;
        }
        if (!empty($_POST['parent_id'])) {
            $q = $this->pdo->prepare("SELECT id
                FROM comments
                WHERE ref = :ref AND ref_id = :ref_id AND id = :id AND parent_id = 0");
            $q->execute([
                'ref' => $ref,
                'ref_id' => $ref_id,
                'id' => $_POST['parent_id']
            ]);
            if($q->rowCount() <= 0){
                $this->errors['parent'] = $this->options['parent_error'];
                return false;
            }
        }
        $q = $this->pdo->prepare("INSERT INTO comments SET
            username = :username,
            email    = :email,
            content  = :content,
            ref_id   = :ref_id,
            ref      = :ref,
            created  = :created,
            parent_id= :parent_id");
        $data = [
            'username' => $_POST['username'],
            'email'    => $_POST['email'],
            'content'  => $_POST['content'],
            'parent_id'=> $_POST['parent_id'],
            'ref_id'   => $ref_id,
            'ref'      => $ref,
            'created'  => date('Y-m-d H:i:s')
        ];
        return $q->execute($data);
    }
 
}