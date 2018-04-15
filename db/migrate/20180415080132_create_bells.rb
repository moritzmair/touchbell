class CreateBells < ActiveRecord::Migration[5.1]
  def change
    create_table :bells do |t|
      t.string :name
      t.string :trigger
      t.string :admin_hash
      t.string :logo

      t.timestamps
    end
  end
end
