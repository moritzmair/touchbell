class AddRequestTypeAndBody < ActiveRecord::Migration[5.1]
  def change
    add_column :bells, :request_type, :string
    add_column :bells, :request_body, :string
  end
end
