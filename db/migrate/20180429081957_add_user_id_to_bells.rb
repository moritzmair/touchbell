class AddUserIdToBells < ActiveRecord::Migration[5.1]
  def change
    add_reference :bells, :user, foreign_key: true
  end
end
