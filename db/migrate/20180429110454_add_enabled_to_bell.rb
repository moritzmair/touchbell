class AddEnabledToBell < ActiveRecord::Migration[5.1]
  def change
    add_column :bells, :enabled, :boolean, default: false
  end
end
